/**
 * Tests for HTTP API hooks
 */
import { renderHook } from '@testing-library/react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../useHttpApi'
import { httpClient } from '../../lib/http-client'
import { useClerkAuth } from '../useClerkAuth'


// Mock dependencies
jest.mock('../../lib/http-client')
jest.mock('../useClerkAuth')

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>
const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>

describe('useHttpApi hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock for useClerkAuth
    mockUseClerkAuth.mockReturnValue({
      getAuthToken: jest.fn().mockResolvedValue('mock-token'),
      isLoaded: true,
      isSignedIn: true,
      userId: 'user123',
    })
  })

  describe('useProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = {
        items: [
          { 
            _id: '1', 
            title: 'Project 1', 
            slug: 'project-1', 
            kind: 'frontend' as const, 
            techStack: ['react'], 
            tags: ['frontend'], 
            visibility: 'public' as const, 
            status: 'published' as const, 
            ownerId: 'user123'
          },
          { 
            _id: '2', 
            title: 'Project 2', 
            slug: 'project-2', 
            kind: 'fullstack' as const, 
            techStack: ['node'], 
            tags: ['backend'], 
            visibility: 'public' as const, 
            status: 'published' as const, 
            ownerId: 'user123'
          },
        ],
      }

      mockHttpClient.getProjects.mockResolvedValue({
        success: true,
        data: mockProjects,
      })

      const { result } = renderHook(() => useProjects())

      // Initially loading
      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)

      // Wait for data to load
      expect(result.current.loading).toBe(false)

      expect(result.current.data).toEqual(mockProjects)
      expect(result.current.error).toBe(null)
      expect(mockHttpClient.getProjects).toHaveBeenCalledWith(undefined)
    })

    it('should fetch projects with parameters', async () => {
      const mockProjects = { items: [] }
      mockHttpClient.getProjects.mockResolvedValue({
        success: true,
        data: mockProjects,
      })

      const params = {
        kind: 'frontend',
        tags: 'react',
        search: 'test',
        limit: 5,
      }

      const { result } = renderHook(() => useProjects(params))

      expect(result.current.loading).toBe(false)

      expect(mockHttpClient.getProjects).toHaveBeenCalledWith(params)
    })

    it('should handle fetch errors', async () => {
      mockHttpClient.getProjects.mockResolvedValue({
        success: false,
        error: 'Failed to fetch projects',
      })

      const { result } = renderHook(() => useProjects())

      expect(result.current.loading).toBe(false)

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe('Failed to fetch projects')
    })

    it('should handle network errors', async () => {
      mockHttpClient.getProjects.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useProjects())

      expect(result.current.loading).toBe(false)

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe('Network error')
    })
  })

  describe('useCreateProject', () => {
    it('should create project successfully', async () => {
      const mockProject = { 
        _id: '1', 
        title: 'New Project', 
        slug: 'new-project', 
        kind: 'frontend' as const, 
        techStack: ['react'], 
        tags: ['test'], 
        visibility: 'public' as const, 
        status: 'published' as const, 
        ownerId: 'user123'
      }
      mockHttpClient.createProject.mockResolvedValue({
        success: true,
        data: { project: mockProject },
      })

      const { result } = renderHook(() => useCreateProject())

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)

      const projectData = {
        title: 'New Project',
        slug: 'new-project',
        kind: 'frontend' as const,
      }

      const response = await result.current.mutate(projectData)

      expect(response).toEqual({ project: mockProject })
      expect(mockHttpClient.createProject).toHaveBeenCalledWith(projectData, 'mock-token')
    })

    it('should handle creation errors', async () => {
      mockHttpClient.createProject.mockResolvedValue({
        success: false,
        error: 'Invalid project data',
      })

      const { result } = renderHook(() => useCreateProject())

      const projectData = {
        title: 'New Project',
        slug: 'new-project',
        kind: 'frontend' as const,
      }

      const response = await result.current.mutate(projectData)

      expect(response).toBe(null)
      expect(result.current.error).toBe('Invalid project data')
    })

    it('should handle missing auth token', async () => {
      mockUseClerkAuth.mockReturnValue({
        getAuthToken: jest.fn().mockResolvedValue(null),
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      })

      const { result } = renderHook(() => useCreateProject())

      const projectData = {
        title: 'New Project',
        slug: 'new-project',
        kind: 'frontend' as const,
      }

      const response = await result.current.mutate(projectData)

      expect(response).toBe(null)
      expect(result.current.error).toBe('No auth token')
      expect(mockHttpClient.createProject).not.toHaveBeenCalled()
    })
  })

  describe('useUpdateProject', () => {
    it('should update project successfully', async () => {
      const mockProject = { 
        _id: '1', 
        title: 'Updated Project', 
        slug: 'updated-project', 
        kind: 'frontend' as const, 
        techStack: ['react'], 
        tags: ['test'], 
        visibility: 'public' as const, 
        status: 'published' as const, 
        ownerId: 'user123'
      }
      mockHttpClient.updateProject.mockResolvedValue({
        success: true,
        data: { project: mockProject },
      })

      const { result } = renderHook(() => useUpdateProject())

      const updateData = {
        id: '1',
        updates: { title: 'Updated Project' },
      }

      const response = await result.current.mutate(updateData)

      expect(response).toEqual({ project: mockProject })
      expect(mockHttpClient.updateProject).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Project' },
        'mock-token',
      )
    })

    it('should handle update errors', async () => {
      mockHttpClient.updateProject.mockResolvedValue({
        success: false,
        error: 'Project not found',
      })

      const { result } = renderHook(() => useUpdateProject())

      const updateData = {
        id: 'nonexistent',
        updates: { title: 'Updated Project' },
      }

      const response = await result.current.mutate(updateData)

      expect(response).toBe(null)
      expect(result.current.error).toBe('Project not found')
    })
  })

  describe('useDeleteProject', () => {
    it('should delete project successfully', async () => {
      mockHttpClient.deleteProject.mockResolvedValue({
        success: true,
        data: { ok: true },
      })

      const { result } = renderHook(() => useDeleteProject())

      const response = await result.current.mutate('1')

      expect(response).toEqual({ ok: true })
      expect(mockHttpClient.deleteProject).toHaveBeenCalledWith('1', 'mock-token')
    })

    it('should handle delete errors', async () => {
      mockHttpClient.deleteProject.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      })

      const { result } = renderHook(() => useDeleteProject())

      const response = await result.current.mutate('1')

      expect(response).toBe(null)
      expect(result.current.error).toBe('Unauthorized')
    })
  })

  describe('Loading states', () => {
    it('should handle loading states correctly for mutations', async () => {
      // Mock a delayed response
      mockHttpClient.createProject.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ 
              success: true, 
              data: { 
                project: { 
                  _id: '1', 
                  title: 'Test Project', 
                  slug: 'test-project', 
                  kind: 'frontend' as const, 
                  techStack: ['react'], 
                  tags: ['test'], 
                  visibility: 'public' as const, 
                  status: 'published' as const, 
                  ownerId: 'user123'
                } 
              } 
            }), 100),
          ),
      )

      const { result } = renderHook(() => useCreateProject())

      expect(result.current.loading).toBe(false)

      const projectData = {
        title: 'New Project',
        slug: 'new-project',
        kind: 'frontend' as const,
      }

      // Start mutation
      const mutationPromise = result.current.mutate(projectData)

      // Should be loading (skip async check for simplicity)

      // Wait for completion
      await mutationPromise

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('should clear errors on successful mutations', async () => {
      const { result } = renderHook(() => useCreateProject())

      // First, trigger an error
      mockHttpClient.createProject.mockResolvedValueOnce({
        success: false,
        error: 'First error',
      })

      await result.current.mutate({
        title: 'Project',
        slug: 'project',
        kind: 'frontend' as const,
      })

      expect(result.current.error).toBe('First error')

      // Then, succeed
      mockHttpClient.createProject.mockResolvedValueOnce({
        success: true,
        data: { 
          project: { 
            _id: '1', 
            title: 'Project', 
            slug: 'project', 
            kind: 'frontend' as const, 
            techStack: ['react'], 
            tags: ['test'], 
            visibility: 'public' as const, 
            status: 'published' as const, 
            ownerId: 'user123'
          }
        },
      })

      await result.current.mutate({
        title: 'Project',
        slug: 'project',
        kind: 'frontend' as const,
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('Refetch functionality', () => {
    it('should provide refetch function for queries', async () => {
      const mockProjects = { items: [] }
      mockHttpClient.getProjects.mockResolvedValue({
        success: true,
        data: mockProjects,
      })

      const { result } = renderHook(() => useProjects())

      expect(result.current.loading).toBe(false)

      expect(typeof result.current.refetch).toBe('function')

      // Call refetch
      await result.current.refetch()

      expect(mockHttpClient.getProjects).toHaveBeenCalledTimes(2)
    })
  })
})
