/**
 * Modern HTTP client for all data operations using fetch with TypeScript support.
 * Centralizes upload logic (request signed URL -> upload -> confirm) and
 * guarantees `projectId` is always provided to the assets endpoints.
 */

import type {
  ApiResponse,
  Project,
  ProjectsListResponse,
  ProjectGetResponse,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  Asset,
  AssetUploadRequest,
  AssetUploadResponse,
  AssetConfirmRequest,
  Message,
  Technology,
  Experience,
  ExperienceCreateRequest,
  // Certification,
  Badge,
  PersonalStatement,
  Methodology,
  SocialMedia,
  Avatar,
  ProjectTechStack,
  User,
} from '@/types/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type AssetUploadKind = 'project' | 'resume' | 'technology' | 'media' | 'avatar' | 'badge' | 'certification' | 'experience' | 'other'

interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
  token?: string
}

/* -----------------------------------------------------
 * Small browser-side helpers (shared by components)
 * ---------------------------------------------------*/

/** Best-effort mime inference when a File lacks `type`. */
export function inferMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'txt':
      return 'text/plain'
    case 'md':
      return 'text/markdown'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'csv':
      return 'text/csv'
    case 'json':
      return 'application/json'
    default:
      return 'application/octet-stream'
  }
}

/** Build a public GCS URL from an object path, gs:// URL, or full https URL. */
export function assetPublicUrl(objectPathOrUrl: string): string {
  if (!objectPathOrUrl) throw new Error('Missing object path/url')

  // Already a full URL?
  if (/^https?:\/\//i.test(objectPathOrUrl)) return objectPathOrUrl

  // gs://bucket/key
  if (objectPathOrUrl.startsWith('gs://')) {
    const rest = objectPathOrUrl.slice(5)
    const [bucket, ...parts] = rest.split('/')
    const key = parts.join('/')
    const safe = key.split('/').map(encodeURIComponent).join('/')
    return `https://storage.googleapis.com/${bucket}/${safe}`
  }

  // Plain key -> need bucket from env
  const bucket = process.env.NEXT_PUBLIC_GCS_BUCKET_UPLOADS
  if (!bucket) throw new Error('NEXT_PUBLIC_GCS_BUCKET_UPLOADS is not set')
  const safe = objectPathOrUrl.split('/').map(encodeURIComponent).join('/')
  return `https://storage.googleapis.com/${bucket}/${safe}`
}

/** Force a file download (preserves filename even cross-origin). */
export async function downloadToDisk(url: string, filename = 'download') {
  if (typeof window === 'undefined') return
  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Failed to download')
  const blob = await resp.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}

/* -----------------------------------------------------
 * Internal helpers for assets API
 * ---------------------------------------------------*/

/**
 * Your server's /assets/request-upload and /assets/confirm
 * REQUIRE `projectId`. For non-project assets, we derive
 * projectId from assetType (e.g. 'resume', 'technology').
 */
function ensureProjectId(
  params: { projectId?: string; assetType?: AssetUploadKind },
  fallback = 'misc',
): string {
  return params.projectId ?? params.assetType ?? fallback
}

/** Normalize the payload sent to /assets/request-upload. */
function normalizeUploadBody(input: AssetUploadRequest): AssetUploadRequest {
  const body = { ...input }
  // Guarantee a projectId for your server contract
  body.projectId = ensureProjectId({ projectId: body.projectId, assetType: body.assetType }, 'misc')
  // assetType and folder are preserved from input
  return body
}

/** Normalize the payload sent to /assets/confirm. */
function normalizeConfirmBody(input: AssetConfirmRequest): AssetConfirmRequest {
  const body = { ...input }
  body.projectId = ensureProjectId(
    { projectId: body.projectId, assetType: input.assetType },
    'misc',
  )
  // Always preserve the assetType field from input
  body.assetType = input.assetType
  return body
}

/* -----------------------------------------------------
 * HTTP Client
 * ---------------------------------------------------*/

class HttpClient {
  private baseUrl: string

  constructor() {
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
    let normalized = rawBase.replace(/\/+$/, '')
    if (!normalized.endsWith('/api/v1')) {
      normalized += '/api/v1'
    }
    this.baseUrl = normalized
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, requiresAuth = false, token } = options

    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (requiresAuth && token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          errors: errorData.errors,
        }
      }

      if (response.status === 204) {
        return { success: true, data: null as T }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /* ---------------------------------------------
   * Shared Upload Flow (signed URL -> PUT -> confirm)
   * -------------------------------------------*/

  /**
   * Upload a File to GCS using your server's signed URL flow and confirm it.
   * Works for ANY assetType. Always supplies `projectId` to match your server contract.
   */
  async uploadAsset(
    file: File,
    opts: {
      assetType: AssetUploadKind
      projectId?: string
      folder?: string
    },
    token: string,
    onProgress?: (percent: number) => void,
  ): Promise<
    ApiResponse<{ asset: Asset; publicUrl: string; viewUrl: string; objectPath: string; assetId?: string }>
  > {
    try {
      const contentType = file.type || inferMimeFromName(file.name)
      const effectiveProjectId = ensureProjectId(
        { projectId: opts.projectId, assetType: opts.assetType },
        'misc',
      )
      
      // The server will organize by assetType automatically
      // Only use folder for sub-organization within the assetType
      const effectiveFolder = opts.folder // Let the server handle assetType organization

      // 1) request a signed URL
      const uploadReq: AssetUploadRequest = normalizeUploadBody({
        filename: file.name,
        contentType,
        size: file.size,
        // server depends on this:
        projectId: effectiveProjectId,
        // optional extras (your server can ignore/accept them)
        assetType: opts.assetType,
        ...(effectiveFolder && { folder: effectiveFolder }),
      })

      const signed = await this.request<AssetUploadResponse>('/assets/request-upload', {
        method: 'POST',
        body: uploadReq,
        requiresAuth: true,
        token,
      })
      if (!signed.success) return signed as any

      const signedPayload = (signed.data as any) || {}
      const signedData =
        signedPayload && typeof signedPayload === 'object' && 'data' in signedPayload
          ? (signedPayload as any).data
          : signedPayload
      const { uploadUrl, objectPath, headers } = (signedData as any) || {}
      if (!uploadUrl || !objectPath) {
        return { success: false, error: 'Missing uploadUrl/objectPath in response' } as any
      }

      // 2) PUT to GCS with progress (browser)
      if (typeof window === 'undefined') {
        const resp = await fetch(uploadUrl, {
          method: 'PUT',
          headers: headers || {},
          body: file,
        })
        if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`)
      } else {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl, true)
          Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, String(v)))
          if (onProgress) {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
            }
          }
          xhr.onerror = () => reject(new Error('Network error while uploading to storage'))
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error(`Upload failed: ${xhr.status}`))
          xhr.send(file)
        })
      }

      // 3) confirm upload
      const confirmBody: AssetConfirmRequest = normalizeConfirmBody({
        objectPath,
        contentType,
        size: file.size,
        projectId: effectiveProjectId,
        assetType: opts.assetType, // Include assetType in confirm request
      })

      const confirmed = await this.request<{ asset: Asset; publicUrl: string; viewUrl: string; assetId?: string }>(
        '/assets/confirm',
        {
          method: 'POST',
          body: confirmBody,
          requiresAuth: true,
          token,
        },
      )
      if (!confirmed.success) return confirmed as any

      const confirmedPayload = (confirmed.data as any) || {}
      const confirmedData =
        confirmedPayload && typeof confirmedPayload === 'object' && 'data' in confirmedPayload
          ? (confirmedPayload as any).data
          : confirmedPayload
      const { asset, publicUrl, viewUrl, assetId } = (confirmedData as any) || {}
      return {
        success: true,
        data: { asset, publicUrl, viewUrl, objectPath, assetId },
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Upload failed' }
    }
  }

  /* ---------------------------------------------
   * Convenience wrappers for callers (optional)
   * -------------------------------------------*/

  async requestUpload(
    request: AssetUploadRequest,
    token: string,
  ): Promise<ApiResponse<AssetUploadResponse>> {
    const body = normalizeUploadBody(request)
    const res = await this.request('/assets/request-upload', {
      method: 'POST',
      body,
      requiresAuth: true,
      token,
    })
    if (!res.success) return res as any
    const payload = (res.data as any) || {}
    const data =
      payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
    return { success: true, data } as any
  }

  async confirmUpload(
    confirmation: AssetConfirmRequest,
    token: string,
  ): Promise<ApiResponse<{ asset: Asset; publicUrl: string; viewUrl: string }>> {
    const body = normalizeConfirmBody(confirmation)
    const res = await this.request('/assets/confirm', {
      method: 'POST',
      body,
      requiresAuth: true,
      token,
    })
    if (!res.success) return res as any
    const payload = (res.data as any) || {}
    const data =
      payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
    return { success: true, data } as any
  }

  /* ---------------------------------------------
   * Existing APIs
   * -------------------------------------------*/

  // Projects API
  async getProjects(params?: {
    category?: string
    search?: string
    limit?: number
    cursor?: string
  }): Promise<ApiResponse<ProjectsListResponse>> {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.cursor) searchParams.set('cursor', params.cursor)

    const query = searchParams.toString()
    return this.request(`/projects${query ? `?${query}` : ''}`)
  }

  async getProject(idOrSlug: string): Promise<ApiResponse<ProjectGetResponse>> {
    return this.request(`/projects/${idOrSlug}`)
  }

  // Resumes API
  async getResumes(): Promise<ApiResponse<{ items: any[] }>> {
    return this.request('/resumes')
  }

  async getCertifications(): Promise<ApiResponse<{ items: any[] }>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getLatestResume(): Promise<ApiResponse<{ resume: any }>> {
    return this.request('/resumes/latest')
  }

  async deleteResume(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/resumes/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }

  async editResume(
    id: string,
    updates: Partial<{ isPublic: boolean; name: string }>,
    token: string,
  ): Promise<ApiResponse<{ resume: any }>> {
    return this.request(`/resumes/${id}`, {
      method: 'PATCH',
      body: updates,
      requiresAuth: true,
      token,
    })
  }

  // Project CRUD
  async createProject(
    project: ProjectCreateRequest,
    token: string,
  ): Promise<ApiResponse<{ project: Project }>> {
    return this.request('/projects', {
      method: 'POST',
      body: project,
      requiresAuth: true,
      token,
    })
  }

  async updateProject(
    id: string,
    updates: ProjectUpdateRequest,
    token: string,
  ): Promise<ApiResponse<{ project: Project }>> {
    return this.request(`/projects/${id}`, {
      method: 'PATCH',
      body: updates,
      requiresAuth: true,
      token,
    })
  }

  async deleteProject(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }

  // TODO: Integrations (GitHub, Vercel) endpoints can be added here in the future

  // Assets browsing
  async browseAssets(
    params: { prefix?: string; limit?: number; type?: string } = {},
    token?: string,
  ): Promise<
    ApiResponse<{
      files: Array<{
        name: string
        size: number
        contentType: string
        timeCreated: string
        updated: string
        publicUrl: string
        viewUrl: string
      }>
      total: number
      hasMore: boolean
    }>
  > {
    const searchParams = new URLSearchParams()
    if (params?.prefix) searchParams.set('prefix', params.prefix)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.type) searchParams.set('type', params.type)

    const query = searchParams.toString()
    return this.request(`/assets/browse${query ? `?${query}` : ''}`, {
      requiresAuth: true,
      token: token || '',
    })
  }

  async getAssetFolders(
    prefix?: string,
    token?: string,
  ): Promise<ApiResponse<{ folders: string[] }>> {
    const searchParams = new URLSearchParams()
    if (prefix) searchParams.set('prefix', prefix)

    const query = searchParams.toString()
    return this.request(`/assets/folders${query ? `?${query}` : ''}`, {
      requiresAuth: true,
      token: token || '',
    })
  }

  // Messages
  async getMessages(token?: string): Promise<ApiResponse<Message[]>> {
    return this.request('/messages', {
      requiresAuth: true,
      token: token || '',
    })
  }

  async createMessage(message: Partial<Message>): Promise<ApiResponse<Message>> {
    return this.request('/messages', {
      method: 'POST',
      body: message,
    })
  }

  async updateMessage(
    id: string,
    updates: { status?: string; priority?: string },
    token: string,
  ): Promise<ApiResponse<{ message: Message }>> {
    return this.request(`/messages/${id}`, {
      method: 'PATCH',
      body: updates,
      requiresAuth: true,
      token,
    })
  }

  async deleteMessage(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/messages/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }

  // Technologies
  async getTechnologies(): Promise<ApiResponse<Technology[]>> {
    return this.request('/technologies')
  }

  async createTechnology(
    tech: Partial<Technology>,
    token: string,
  ): Promise<ApiResponse<{ technology: Technology }>> {
    return this.request('/technologies', {
      method: 'POST',
      body: tech,
      requiresAuth: true,
      token,
    })
  }

  async updateTechnology(
    id: string,
    updates: Partial<Technology>,
    token: string,
  ): Promise<ApiResponse<{ technology: Technology }>> {
    return this.request(`/technologies/${id}`, {
      method: 'PATCH',
      body: updates,
      requiresAuth: true,
      token,
    })
  }

  async deleteTechnology(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/technologies/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }

  // Stubs
  async getUsers(): Promise<ApiResponse<User[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async createUser(): Promise<ApiResponse<User>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getPersonalStatement(): Promise<ApiResponse<PersonalStatement>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getBadges(): Promise<ApiResponse<Badge[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getExperiences(): Promise<ApiResponse<Experience[]>> {
    return this.request('/experiences')
  }

  async createExperience(
    experience: ExperienceCreateRequest,
    token: string,
  ): Promise<ApiResponse<{ experience: Experience }>> {
    return this.request('/experiences', {
      method: 'POST',
      body: experience,
      requiresAuth: true,
      token,
    })
  }

  async updateExperience(
    id: string,
    updates: Partial<Experience>,
    token: string,
  ): Promise<ApiResponse<{ experience: Experience }>> {
    return this.request(`/experiences/${id}`, {
      method: 'PATCH',
      body: updates,
      requiresAuth: true,
      token,
    })
  }

  async deleteExperience(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/experiences/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }

  async getSocialMedia(): Promise<ApiResponse<SocialMedia[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getMethodology(): Promise<ApiResponse<Methodology[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getProjectTechStack(): Promise<ApiResponse<ProjectTechStack[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getAvatars(): Promise<ApiResponse<Avatar[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  // Asset deletion
  async deleteAsset(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/assets/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }
}

// Singleton instance
export const httpClient = new HttpClient()
