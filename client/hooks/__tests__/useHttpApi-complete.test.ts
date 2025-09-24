/**
 * Comprehensive tests for ALL HTTP API hooks and CRUD operations
 */
import { renderHook, waitFor } from '@testing-library/react'
import {
  useProjects, useCreateProject, useUpdateProject, useDeleteProject,
  useExperiences, useCreateExperience, useUpdateExperience, useDeleteExperience,
  useTechnologies, useCreateTechnology, useUpdateTechnology, useDeleteTechnology,
  useBadges, useMessages, useCreateMessage, useUpdateMessage, useDeleteMessage,
  useResumes, useDeleteResume, useEditResume
} from '../useHttpApi'
import { httpClient } from '../../lib/http-client'
import { useClerkAuth } from '../useClerkAuth'
import type { Experience, Technology, Message, ExperienceCreateRequest } from '../../types/api'

// Mock dependencies
jest.mock('../../lib/http-client')
jest.mock('../useClerkAuth')

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>
const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>

describe('Complete HTTP API hooks', () => {
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

  // =============================================================================
  // EXPERIENCES CRUD
  // =============================================================================
  describe('Experiences CRUD', () => {
    const mockExperience: Experience = {
      _id: '1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      employmentType: 'Full-time',
      location: 'New York, NY',
      locationType: 'Remote',
      description: 'Developed amazing features',
      startDate: '2022-01',
      endDate: '2023-12',
      current: false,
      skills: ['React', 'TypeScript', 'Node.js'],
      companyLogoUrl: 'https://example.com/logo.png',
      linkedinUrl: 'https://linkedin.com/company/tech-corp',
      ownerId: 'user123'
    }

    describe('useExperiences', () => {
      it('should fetch experiences successfully with auth token', async () => {
        const mockExperiences = [mockExperience]
        mockHttpClient.getExperiences.mockResolvedValue({
          success: true,
          data: mockExperiences,
        })

        const { result } = renderHook(() => useExperiences())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockExperiences)
        expect(result.current.error).toBe(null)
        expect(mockHttpClient.getExperiences).toHaveBeenCalledWith('mock-token')
      })

      it('should handle missing auth token', async () => {
        mockUseClerkAuth.mockReturnValue({
          getAuthToken: jest.fn().mockResolvedValue(null),
          isLoaded: true,
          isSignedIn: false,
          userId: null,
        })

        const { result } = renderHook(() => useExperiences())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toBe(null)
        expect(result.current.error).toBe('No auth token')
        expect(mockHttpClient.getExperiences).not.toHaveBeenCalled()
      })

      it('should handle API errors', async () => {
        mockHttpClient.getExperiences.mockResolvedValue({
          success: false,
          error: 'Server error',
        })

        const { result } = renderHook(() => useExperiences())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toBe(null)
        expect(result.current.error).toBe('Server error')
      })
    })

    describe('useCreateExperience', () => {
      it('should create experience successfully', async () => {
        const createData: ExperienceCreateRequest = {
          title: 'New Job',
          company: 'New Corp',
          employmentType: 'Full-time',
          location: 'Boston, MA',
          locationType: 'On-site',
          description: 'Building products',
          startDate: '2024-01',
          current: true,
          skills: ['Vue.js', 'Python']
        }

        mockHttpClient.createExperience.mockResolvedValue({
          success: true,
          data: { experience: { ...mockExperience, ...createData } },
        })

        const { result } = renderHook(() => useCreateExperience())

        const response = await result.current.mutate(createData)

        expect(response).toEqual({ experience: { ...mockExperience, ...createData } })
        expect(mockHttpClient.createExperience).toHaveBeenCalledWith(createData, 'mock-token')
      })

      it('should handle validation errors', async () => {
        mockHttpClient.createExperience.mockResolvedValue({
          success: false,
          error: 'Title is required',
        })

        const { result } = renderHook(() => useCreateExperience())

        const invalidData = { company: 'Test Corp' } as ExperienceCreateRequest

        const response = await result.current.mutate(invalidData)

        expect(response).toBe(null)
        expect(result.current.error).toBe('Title is required')
      })
    })

    describe('useUpdateExperience', () => {
      it('should update experience successfully', async () => {
        const updates = { title: 'Senior Software Engineer', current: true }
        const updatedExperience = { ...mockExperience, ...updates }

        mockHttpClient.updateExperience.mockResolvedValue({
          success: true,
          data: { experience: updatedExperience },
        })

        const { result } = renderHook(() => useUpdateExperience())

        const response = await result.current.mutate({ id: '1', updates })

        expect(response).toEqual({ experience: updatedExperience })
        expect(mockHttpClient.updateExperience).toHaveBeenCalledWith('1', updates, 'mock-token')
      })

      it('should handle update errors', async () => {
        mockHttpClient.updateExperience.mockResolvedValue({
          success: false,
          error: 'Experience not found',
        })

        const { result } = renderHook(() => useUpdateExperience())

        const response = await result.current.mutate({
          id: 'nonexistent',
          updates: { title: 'New Title' }
        })

        expect(response).toBe(null)
        expect(result.current.error).toBe('Experience not found')
      })
    })

    describe('useDeleteExperience', () => {
      it('should delete experience successfully', async () => {
        mockHttpClient.deleteExperience.mockResolvedValue({
          success: true,
          data: { ok: true },
        })

        const { result } = renderHook(() => useDeleteExperience())

        const response = await result.current.mutate('1')

        expect(response).toEqual({ ok: true })
        expect(mockHttpClient.deleteExperience).toHaveBeenCalledWith('1', 'mock-token')
      })
    })
  })

  // =============================================================================
  // TECHNOLOGIES CRUD
  // =============================================================================
  describe('Technologies CRUD', () => {
    const mockTechnology: Technology = {
      _id: '1',
      name: 'React',
      category: 'frontend',
      proficiency: 'advanced',
      description: 'JavaScript library for building user interfaces',
      iconUrl: 'https://example.com/react-icon.png',
      websiteUrl: 'https://reactjs.org',
      experience: 24,
      lastUsed: '2024-01',
      featured: true,
      ownerId: 'user123'
    }

    describe('useTechnologies', () => {
      it('should fetch technologies successfully', async () => {
        const mockTechnologies = [mockTechnology]
        mockHttpClient.getTechnologies.mockResolvedValue({
          success: true,
          data: mockTechnologies,
        })

        const { result } = renderHook(() => useTechnologies())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockTechnologies)
        expect(mockHttpClient.getTechnologies).toHaveBeenCalledWith('mock-token')
      })

      it('should handle auth token issues', async () => {
        mockUseClerkAuth.mockReturnValue({
          getAuthToken: jest.fn().mockResolvedValue(null),
          isLoaded: true,
          isSignedIn: false,
          userId: null,
        })

        const { result } = renderHook(() => useTechnologies())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.error).toBe('No auth token')
      })
    })

    describe('useCreateTechnology', () => {
      it('should create technology successfully', async () => {
        const createData = {
          name: 'Vue.js',
          category: 'frontend',
          proficiency: 'intermediate'
        }

        mockHttpClient.createTechnology.mockResolvedValue({
          success: true,
          data: { technology: { ...mockTechnology, ...createData } },
        })

        const { result } = renderHook(() => useCreateTechnology())

        const response = await result.current.mutate(createData)

        expect(response).toEqual({ technology: { ...mockTechnology, ...createData } })
        expect(mockHttpClient.createTechnology).toHaveBeenCalledWith(createData, 'mock-token')
      })
    })

    describe('useUpdateTechnology', () => {
      it('should update technology successfully', async () => {
        const updates = { proficiency: 'expert', featured: true }

        mockHttpClient.updateTechnology.mockResolvedValue({
          success: true,
          data: { technology: { ...mockTechnology, ...updates } },
        })

        const { result } = renderHook(() => useUpdateTechnology())

        const response = await result.current.mutate({ id: '1', updates })

        expect(response).toEqual({ technology: { ...mockTechnology, ...updates } })
        expect(mockHttpClient.updateTechnology).toHaveBeenCalledWith('1', updates, 'mock-token')
      })
    })

    describe('useDeleteTechnology', () => {
      it('should delete technology successfully', async () => {
        mockHttpClient.deleteTechnology.mockResolvedValue({
          success: true,
          data: { ok: true },
        })

        const { result } = renderHook(() => useDeleteTechnology())

        const response = await result.current.mutate('1')

        expect(response).toEqual({ ok: true })
        expect(mockHttpClient.deleteTechnology).toHaveBeenCalledWith('1', 'mock-token')
      })
    })
  })

  // =============================================================================
  // BADGES
  // =============================================================================
  describe('Badges', () => {
    const mockBadge = {
      _id: '1',
      name: 'React Certificate',
      size: 12345,
      contentType: 'image/png',
      timeCreated: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z',
      objectPath: 'badge/user123/cert.png',
      publicUrl: 'https://storage.googleapis.com/bucket/badge/user123/cert.png',
      viewUrl: 'https://storage.googleapis.com/bucket/badge/user123/cert.png'
    }

    describe('useBadges', () => {
      it('should fetch badges successfully', async () => {
        const mockBadges = {
          badges: [mockBadge],
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1
        }

        mockHttpClient.getBadges.mockResolvedValue({
          success: true,
          data: mockBadges,
        })

        const { result } = renderHook(() => useBadges())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockBadges)
      })
    })
  })

  // =============================================================================
  // MESSAGES CRUD
  // =============================================================================
  describe('Messages CRUD', () => {
    const mockMessage: Message = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Message',
      message: 'Hello, this is a test message.',
      status: 'unread',
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    describe('useMessages', () => {
      it('should fetch messages successfully', async () => {
        const mockMessages = [mockMessage]
        mockHttpClient.getMessages.mockResolvedValue({
          success: true,
          data: mockMessages,
        })

        const { result } = renderHook(() => useMessages())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockMessages)
      })
    })

    describe('useCreateMessage', () => {
      it('should create message successfully', async () => {
        const createData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'New Message',
          message: 'Hello from Jane'
        }

        mockHttpClient.createMessage.mockResolvedValue({
          success: true,
          data: { ...mockMessage, ...createData },
        })

        const { result } = renderHook(() => useCreateMessage())

        const response = await result.current.mutate(createData)

        expect(response).toEqual({ ...mockMessage, ...createData })
        expect(mockHttpClient.createMessage).toHaveBeenCalledWith(createData)
      })
    })

    describe('useUpdateMessage', () => {
      it('should update message successfully', async () => {
        const updates = { status: 'read', priority: 'high' }

        mockHttpClient.updateMessage.mockResolvedValue({
          success: true,
          data: { message: { ...mockMessage, ...updates } },
        })

        const { result } = renderHook(() => useUpdateMessage())

        const response = await result.current.mutate({ id: '1', updates })

        expect(response).toEqual({ message: { ...mockMessage, ...updates } })
        expect(mockHttpClient.updateMessage).toHaveBeenCalledWith('1', updates, 'mock-token')
      })
    })

    describe('useDeleteMessage', () => {
      it('should delete message successfully', async () => {
        mockHttpClient.deleteMessage.mockResolvedValue({
          success: true,
          data: { ok: true },
        })

        const { result } = renderHook(() => useDeleteMessage())

        const response = await result.current.mutate('1')

        expect(response).toEqual({ ok: true })
        expect(mockHttpClient.deleteMessage).toHaveBeenCalledWith('1', 'mock-token')
      })
    })
  })

  // =============================================================================
  // RESUMES
  // =============================================================================
  describe('Resumes', () => {
    const mockResume = {
      _id: '1',
      filename: 'resume.pdf',
      publicUrl: 'https://storage.googleapis.com/bucket/resumes/resume.pdf',
      size: 123456,
      contentType: 'application/pdf',
      timeCreated: '2024-01-01T00:00:00Z',
      isPublic: true,
      name: 'My Resume'
    }

    describe('useResumes', () => {
      it('should fetch resumes successfully', async () => {
        const mockResumes = { items: [mockResume] }
        mockHttpClient.getResumes.mockResolvedValue({
          success: true,
          data: mockResumes,
        })

        const { result } = renderHook(() => useResumes())

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(mockResumes)
      })
    })

    describe('useDeleteResume', () => {
      it('should delete resume successfully', async () => {
        mockHttpClient.deleteResume.mockResolvedValue({
          success: true,
          data: { ok: true },
        })

        const { result } = renderHook(() => useDeleteResume())

        const response = await result.current.mutate('1')

        expect(response).toEqual({ ok: true })
        expect(mockHttpClient.deleteResume).toHaveBeenCalledWith('1', 'mock-token')
      })
    })

    describe('useEditResume', () => {
      it('should edit resume successfully', async () => {
        const updates = { isPublic: false, name: 'Updated Resume' }

        mockHttpClient.editResume.mockResolvedValue({
          success: true,
          data: { resume: { ...mockResume, ...updates } },
        })

        const { result } = renderHook(() => useEditResume())

        const response = await result.current.mutate({ id: '1', updates })

        expect(response).toEqual({ resume: { ...mockResume, ...updates } })
        expect(mockHttpClient.editResume).toHaveBeenCalledWith('1', updates, 'mock-token')
      })
    })
  })

  // =============================================================================
  // ERROR HANDLING AND EDGE CASES
  // =============================================================================
  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      mockHttpClient.getExperiences.mockRejectedValue(new Error('Network timeout'))

      const { result } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network timeout')
      expect(result.current.data).toBe(null)
    })

    it('should handle token refresh during mutation', async () => {
      const getAuthTokenMock = jest.fn()
        .mockResolvedValueOnce(null) // First call returns null
        .mockResolvedValueOnce('refreshed-token') // Second call returns new token

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      mockHttpClient.createExperience.mockResolvedValue({
        success: true,
        data: { experience: {} as Experience },
      })

      const { result } = renderHook(() => useCreateExperience())

      // First attempt should fail with no token
      let response = await result.current.mutate({
        title: 'Test',
        company: 'Test Corp',
        employmentType: 'Full-time'
      } as ExperienceCreateRequest)

      expect(response).toBe(null)
      expect(result.current.error).toBe('No auth token')

      // Simulate token refresh by re-rendering
      const { result: result2 } = renderHook(() => useCreateExperience())

      response = await result2.current.mutate({
        title: 'Test',
        company: 'Test Corp',
        employmentType: 'Full-time'
      } as ExperienceCreateRequest)

      expect(response).toEqual({ experience: {} })
      expect(mockHttpClient.createExperience).toHaveBeenCalledWith(
        expect.any(Object),
        'refreshed-token'
      )
    })

    it('should handle malformed API responses', async () => {
      // @ts-ignore - intentionally testing malformed response
      mockHttpClient.getExperiences.mockResolvedValue({
        success: true,
        // Missing data field
      })

      const { result } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)
    })

    it('should handle concurrent mutations', async () => {
      const createData1 = { title: 'Job 1', company: 'Corp 1', employmentType: 'Full-time' } as ExperienceCreateRequest
      const createData2 = { title: 'Job 2', company: 'Corp 2', employmentType: 'Part-time' } as ExperienceCreateRequest

      mockHttpClient.createExperience
        .mockResolvedValueOnce({
          success: true,
          data: { experience: { ...createData1, _id: '1' } as Experience },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { experience: { ...createData2, _id: '2' } as Experience },
        })

      const { result } = renderHook(() => useCreateExperience())

      // Start both mutations concurrently
      const [response1, response2] = await Promise.all([
        result.current.mutate(createData1),
        result.current.mutate(createData2),
      ])

      expect(response1).toEqual({ experience: { ...createData1, _id: '1' } })
      expect(response2).toEqual({ experience: { ...createData2, _id: '2' } })
      expect(mockHttpClient.createExperience).toHaveBeenCalledTimes(2)
    })
  })

  // =============================================================================
  // LOADING STATES
  // =============================================================================
  describe('Loading States', () => {
    it('should manage loading states correctly for queries', async () => {
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })

      mockHttpClient.getExperiences.mockReturnValue(delayedPromise as any)

      const { result } = renderHook(() => useExperiences())

      // Should start loading
      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)

      // Resolve the promise
      resolvePromise({
        success: true,
        data: [{ _id: '1', title: 'Test Experience' }],
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual([{ _id: '1', title: 'Test Experience' }])
    })
  })

  // =============================================================================
  // DATA VALIDATION
  // =============================================================================
  describe('Data Validation', () => {
    it('should validate experience data structure', async () => {
      const invalidExperienceData = {
        title: 'Test Job',
        // Missing required company field
        employmentType: 'Full-time',
      }

      mockHttpClient.createExperience.mockResolvedValue({
        success: false,
        error: 'Company is required',
        errors: ['Company field is missing'],
      })

      const { result } = renderHook(() => useCreateExperience())

      const response = await result.current.mutate(invalidExperienceData as ExperienceCreateRequest)

      expect(response).toBe(null)
      expect(result.current.error).toBe('Company is required')
    })

    it('should validate technology proficiency levels', async () => {
      const invalidTechData = {
        name: 'React',
        category: 'frontend',
        proficiency: 'invalid-level', // Invalid proficiency
      }

      mockHttpClient.createTechnology.mockResolvedValue({
        success: false,
        error: 'Invalid proficiency level',
      })

      const { result } = renderHook(() => useCreateTechnology())

      const response = await result.current.mutate(invalidTechData)

      expect(response).toBe(null)
      expect(result.current.error).toBe('Invalid proficiency level')
    })
  })
})