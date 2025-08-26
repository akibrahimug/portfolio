/**
 * React hooks for HTTP API operations.
 * Provides a clean, typed interface for data fetching with loading states and error handling.
 */

import { useState, useEffect, useCallback } from 'react'

import { httpClient } from '@/lib/http-client'
import { useClerkAuth } from '@/hooks/useClerkAuth'
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  AssetUploadRequest,
  AssetConfirmRequest,
  Message,
  Technology,
  Experience,
  ExperienceCreateRequest,
} from '@/types/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseApiMutation<T, P> {
  mutate: (params: P) => Promise<T | null>
  loading: boolean
  error: string | null
}

// Generic hook for GET requests
function useApiQuery<T>(
  queryFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  deps: any[] = [],
): UseApiState<T> {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: string | null
  }>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await queryFn()
      if (response.success) {
        setState({ data: response.data || null, loading: false, error: null })
      } else {
        setState({ data: null, loading: false, error: response.error || 'Unknown error' })
      }
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch: fetchData,
  }
}

// Generic hook for mutations (POST, PUT, DELETE, etc.)
function useApiMutation<T, P>(
  mutationFn: (params: P) => Promise<{ success: boolean; data?: T; error?: string }>,
): UseApiMutation<T, P> {
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
  }>({
    loading: false,
    error: null,
  })

  const mutate = useCallback(
    async (params: P): Promise<T | null> => {
      setState({ loading: true, error: null })

      try {
        const response = await mutationFn(params)
        if (response.success) {
          setState({ loading: false, error: null })
          return response.data || null
        } else {
          setState({ loading: false, error: response.error || 'Unknown error' })
          return null
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setState({ loading: false, error: errorMessage })
        return null
      }
    },
    [mutationFn],
  )

  return {
    mutate,
    ...state,
  }
}

// Specific hooks for different API endpoints

export function useProjects(params?: {
  kind?: string
  tags?: string
  search?: string
  limit?: number
  cursor?: string
}) {
  return useApiQuery(
    () => httpClient.getProjects(params),
    [params?.kind, params?.tags, params?.search, params?.limit, params?.cursor],
  )
}

export function useProject(idOrSlug: string | null) {
  return useApiQuery(
    () =>
      idOrSlug ? httpClient.getProject(idOrSlug) : Promise.resolve({ success: true, data: null }),
    [idOrSlug],
  )
}

export function useCreateProject() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (project: ProjectCreateRequest) => {
    const token = await getAuthToken()
    return token
      ? httpClient.createProject(project, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useUpdateProject() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async ({ id, updates }: { id: string; updates: ProjectUpdateRequest }) => {
    const token = await getAuthToken()
    return token
      ? httpClient.updateProject(id, updates, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useDeleteProject() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (id: string) => {
    const token = await getAuthToken()
    return token
      ? httpClient.deleteProject(id, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useMessages() {
  const { getAuthToken } = useClerkAuth()

  return useApiQuery(async () => {
    const token = await getAuthToken()
    return token
      ? httpClient.getMessages(token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useCreateMessage() {
  return useApiMutation((message: Partial<Message>) => httpClient.createMessage(message))
}

export function useUpdateMessage() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(
    async ({ id, updates }: { id: string; updates: { status?: string; priority?: string } }) => {
      const token = await getAuthToken()
      return token
        ? httpClient.updateMessage(id, updates, token)
        : Promise.resolve({ success: false, error: 'No auth token' })
    },
  )
}

export function useDeleteMessage() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (id: string) => {
    const token = await getAuthToken()
    return token
      ? httpClient.deleteMessage(id, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useTechnologies() {
  return useApiQuery(() => httpClient.getTechnologies())
}

export function useCreateTechnologies() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (tech: Partial<Technology>) => {
    const token = await getAuthToken()
    return token
      ? httpClient.createTechnologies(tech, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useUpdateTechnology() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async ({ id, updates }: { id: string; updates: Partial<Technology> }) => {
    const token = await getAuthToken()
    return token
      ? httpClient.updateTechnology(id, updates, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useDeleteTechnology() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (id: string) => {
    const token = await getAuthToken()
    return token
      ? httpClient.deleteTechnology(id, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useCertifications() {
  return useApiQuery(() => httpClient.getCertifications())
}

export function useBadges() {
  return useApiQuery(() => httpClient.getBadges())
}

export function useExperiences() {
  return useApiQuery(() => httpClient.getExperiences())
}

export function useCreateExperience() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (experience: ExperienceCreateRequest) => {
    const token = await getAuthToken()
    return token
      ? httpClient.createExperience(experience, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useUpdateExperience() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async ({ id, updates }: { id: string; updates: Partial<Experience> }) => {
    const token = await getAuthToken()
    return token
      ? httpClient.updateExperience(id, updates, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useDeleteExperience() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (id: string) => {
    const token = await getAuthToken()
    return token
      ? httpClient.deleteExperience(id, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useResumes() {
  return useApiQuery(() => httpClient.getResumes())
}

export function usePersonalStatement() {
  return useApiQuery(() => httpClient.getPersonalStatement())
}

export function useMethodology() {
  return useApiQuery(() => httpClient.getMethodology())
}

export function useSocialMedia() {
  return useApiQuery(() => httpClient.getSocialMedia())
}

export function useProjectTechStack() {
  return useApiQuery(() => httpClient.getProjectTechStack())
}

export function useAvatars() {
  return useApiQuery(() => httpClient.getAvatars())
}

// Asset upload hooks
export function useRequestUpload() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (request: AssetUploadRequest) => {
    const token = await getAuthToken()
    return token
      ? httpClient.requestUpload(request, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

export function useConfirmUpload() {
  const { getAuthToken } = useClerkAuth()

  return useApiMutation(async (confirmation: AssetConfirmRequest) => {
    const token = await getAuthToken()
    return token
      ? httpClient.confirmUpload(confirmation, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

// Browse assets (auth required)
export function useBrowseAssets() {
  const { getAuthToken } = useClerkAuth()
  return useApiQuery(async () => {
    const token = await getAuthToken()
    return token
      ? httpClient.browseAssets({}, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  })
}

// List asset folders (auth required)
export function useAssetFolders(prefix?: string) {
  const { getAuthToken } = useClerkAuth()
  return useApiQuery(async () => {
    const token = await getAuthToken()
    return token
      ? httpClient.getAssetFolders(prefix, token)
      : Promise.resolve({ success: false, error: 'No auth token' })
  }, [prefix])
}
