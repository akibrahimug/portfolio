/**
 * Modern HTTP client for all data operations using fetch with TypeScript support.
 * Replaces the old NoAuth class and provides a clean, typed API.
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
  Certification,
  Badge,
  Resume,
  PersonalStatement,
  Methodology,
  SocialMedia,
  Avatar,
  ProjectTechStack,
  User,
} from '@/types/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  requiresAuth?: boolean
  token?: string
}

class HttpClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    if (!this.baseUrl.endsWith('/')) {
      this.baseUrl += '/'
    }
    // Remove trailing slash and add v1 if not present
    this.baseUrl = this.baseUrl.replace(/\/+$/, '') + '/v1'
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
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

      // Handle 204 No Content
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

  // Projects API
  async getProjects(params?: {
    kind?: string
    tags?: string
    search?: string
    limit?: number
    cursor?: string
  }): Promise<ApiResponse<ProjectsListResponse>> {
    const searchParams = new URLSearchParams()
    if (params?.kind) searchParams.set('kind', params.kind)
    if (params?.tags) searchParams.set('tags', params.tags)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.cursor) searchParams.set('cursor', params.cursor)

    const query = searchParams.toString()
    return this.request(`/projects${query ? `?${query}` : ''}`)
  }

  async getProject(idOrSlug: string): Promise<ApiResponse<ProjectGetResponse>> {
    return this.request(`/projects/${idOrSlug}`)
  }

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

  // Assets API
  async requestUpload(
    request: AssetUploadRequest,
    token: string,
  ): Promise<ApiResponse<AssetUploadResponse>> {
    return this.request('/assets/request-upload', {
      method: 'POST',
      body: request,
      requiresAuth: true,
      token,
    })
  }

  async confirmUpload(
    confirmation: AssetConfirmRequest,
    token: string,
  ): Promise<ApiResponse<{ asset: Asset }>> {
    return this.request('/assets/confirm', {
      method: 'POST',
      body: confirmation,
      requiresAuth: true,
      token,
    })
  }

  async browseAssets(params?: { prefix?: string; limit?: number; type?: string }): Promise<
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
      token: 'placeholder-token', // TODO: Get real auth token from Clerk when implemented
    })
  }

  async getAssetFolders(prefix?: string): Promise<ApiResponse<{ folders: string[] }>> {
    const searchParams = new URLSearchParams()
    if (prefix) searchParams.set('prefix', prefix)

    const query = searchParams.toString()
    return this.request(`/assets/folders${query ? `?${query}` : ''}`, {
      requiresAuth: true,
      token: 'placeholder-token', // TODO: Get real auth token from Clerk when implemented
    })
  }

  // Generic methods for endpoints that don't exist yet on server
  // These will return placeholder responses until server endpoints are implemented
  async getUsers(): Promise<ApiResponse<User[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async createUser(): Promise<ApiResponse<User>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getMessages(): Promise<ApiResponse<Message[]>> {
    return this.request('/messages', { requiresAuth: true })
  }

  async createMessage(message: Partial<Message>): Promise<ApiResponse<Message>> {
    return this.request('/messages', {
      method: 'POST',
      body: message,
    })
  }

  async deleteMessage(id: string, token: string): Promise<ApiResponse<{ ok: boolean }>> {
    return this.request(`/messages/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
      token,
    })
  }

  async getPersonalStatement(): Promise<ApiResponse<PersonalStatement>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getTechnologies(): Promise<ApiResponse<Technology[]>> {
    return this.request('/technologies')
  }

  async createTechnologies(
    tech: Partial<Technology>,
    token?: string,
  ): Promise<ApiResponse<Technology>> {
    return this.request('/technologies', {
      method: 'POST',
      body: tech,
      requiresAuth: true,
      token: token || '',
    })
  }

  async getCertifications(): Promise<ApiResponse<Certification[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getBadges(): Promise<ApiResponse<Badge[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
  }

  async getExperiences(): Promise<ApiResponse<Experience[]>> {
    return this.request('/experiences')
  }

  async createExperience(
    experience: Omit<Experience, '_id'>,
  ): Promise<ApiResponse<{ experience: Experience }>> {
    return this.request('/experiences', {
      method: 'POST',
      body: experience,
      requiresAuth: false, // TODO: Enable auth when Clerk is implemented
    })
  }

  async getResumes(): Promise<ApiResponse<Resume[]>> {
    return { success: false, error: 'Endpoint not implemented on server yet' }
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
}

// Singleton instance
export const httpClient = new HttpClient()
