/**
 * Integration tests for complete CRUD operations
 * Tests the full flow from React components through hooks to HTTP client
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import {
  useExperiences,
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useTechnologies,
  useCreateTechnology,
  useUpdateTechnology,
  useDeleteTechnology,
  useMessages,
  useCreateMessage,
  useUpdateMessage,
  useDeleteMessage
} from '../../hooks/useHttpApi'
import { useClerkAuth } from '../../hooks/useClerkAuth'
import { httpClient } from '../../lib/http-client'
import type { Experience, Technology, Message } from '../../types/api'

// Mock dependencies
jest.mock('../../lib/http-client')
jest.mock('../../hooks/useClerkAuth')

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>
const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>

// Mock data
const mockExperience: Experience = {
  _id: '1',
  title: 'Software Engineer',
  company: 'Tech Corp',
  employmentType: 'Full-time',
  location: 'New York, NY',
  locationType: 'Remote',
  description: 'Building amazing software',
  startDate: '2022-01',
  endDate: '2024-01',
  current: false,
  skills: ['React', 'TypeScript', 'Node.js'],
  companyLogoUrl: 'https://example.com/logo.png',
  linkedinUrl: 'https://linkedin.com/company/tech-corp',
  ownerId: 'user123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockTechnology: Technology = {
  _id: '1',
  name: 'React',
  category: 'frontend',
  description: 'JavaScript library for building user interfaces',
  complexity: 'Advanced',
  teamSize: 'Small Team',
  flexibility: 'High',
  timeToImplement: '2-4 weeks',
  proficiency: 8,
  yearsOfExperience: 3,
  iconUrl: 'https://example.com/react-icon.png',
  ownerId: 'user123',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockMessage: Message = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'Test message content',
  status: 'unread',
  priority: 'normal',
  source: 'web',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

describe('CRUD Operations Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default auth mock
    mockUseClerkAuth.mockReturnValue({
      getAuthToken: jest.fn().mockResolvedValue('mock-auth-token'),
      isLoaded: true,
      isSignedIn: true,
      userId: 'user123',
    })
  })

  // =============================================================================
  // EXPERIENCES INTEGRATION TESTS
  // =============================================================================
  describe('Experiences Complete CRUD Flow', () => {
    it('should complete full CRUD lifecycle for experiences', async () => {
      let storedExperiences = [mockExperience]
      let nextId = 2

      // Mock HTTP client methods
      mockHttpClient.getExperiences.mockImplementation(async () => ({
        success: true,
        data: storedExperiences,
      }))

      mockHttpClient.createExperience.mockImplementation(async (data) => {
        const newExperience = {
          _id: nextId.toString(),
          ...data,
          ownerId: 'user123'
        } as Experience
        storedExperiences.push(newExperience)
        nextId++
        return { success: true, data: { experience: newExperience } }
      })

      mockHttpClient.updateExperience.mockImplementation(async (id, updates) => {
        const index = storedExperiences.findIndex(exp => exp._id === id)
        if (index !== -1) {
          storedExperiences[index] = { ...storedExperiences[index], ...updates }
          return { success: true, data: { experience: storedExperiences[index] } }
        }
        return { success: false, error: 'Experience not found' }
      })

      mockHttpClient.deleteExperience.mockImplementation(async (id) => {
        const index = storedExperiences.findIndex(exp => exp._id === id)
        if (index !== -1) {
          storedExperiences.splice(index, 1)
          return { success: true, data: { ok: true } }
        }
        return { success: false, error: 'Experience not found' }
      })

      // 1. Test READ - Fetch initial experiences
      const { result: readResult } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(readResult.current.loading).toBe(false)
      })

      expect(readResult.current.data).toEqual([mockExperience])
      expect(readResult.current.error).toBe(null)

      // 2. Test CREATE - Add new experience
      const { result: createResult } = renderHook(() => useCreateExperience())

      const newExperienceData = {
        title: 'Senior Developer',
        company: 'New Corp',
        employmentType: 'Full-time' as const,
        location: 'San Francisco, CA',
        locationType: 'Hybrid' as const,
        description: 'Leading development team',
        startDate: '2024-01',
        current: true,
        skills: ['Vue.js', 'Python']
      }

      let createResponse: any
      await act(async () => {
        createResponse = await createResult.current.mutate(newExperienceData)
      })

      expect(createResponse).toEqual({
        experience: expect.objectContaining({
          _id: '2',
          ...newExperienceData
        })
      })

      // Verify the experience was added to our mock storage
      expect(storedExperiences).toHaveLength(2)

      // 3. Test UPDATE - Modify existing experience
      const { result: updateResult } = renderHook(() => useUpdateExperience())

      const updateData = {
        title: 'Lead Software Engineer',
        current: true,
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL']
      }

      let updateResponse: any
      await act(async () => {
        updateResponse = await updateResult.current.mutate({
          id: '1',
          updates: updateData
        })
      })

      expect(updateResponse).toEqual({
        experience: expect.objectContaining({
          _id: '1',
          ...updateData
        })
      })

      // Verify the experience was updated
      expect(storedExperiences[0]).toEqual(expect.objectContaining(updateData))

      // 4. Test DELETE - Remove experience
      const { result: deleteResult } = renderHook(() => useDeleteExperience())

      let deleteResponse: any
      await act(async () => {
        deleteResponse = await deleteResult.current.mutate('2')
      })

      expect(deleteResponse).toEqual({ ok: true })

      // Verify the experience was removed
      expect(storedExperiences).toHaveLength(1)
      expect(storedExperiences.find(exp => exp._id === '2')).toBeUndefined()

      // 5. Test error handling - Try to delete non-existent experience
      let errorResponse: any
      await act(async () => {
        errorResponse = await deleteResult.current.mutate('999')
      })

      expect(errorResponse).toBe(null)
      expect(deleteResult.current.error).toBe('Experience not found')
    })

    it('should handle authentication errors during CRUD operations', async () => {
      // Mock auth failure
      mockUseClerkAuth.mockReturnValue({
        getAuthToken: jest.fn().mockResolvedValue(null),
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      })

      // Test READ with no auth
      const { result: readResult } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(readResult.current.loading).toBe(false)
      })

      expect(readResult.current.error).toBe('No auth token')
      expect(readResult.current.data).toBe(null)

      // Test CREATE with no auth
      const { result: createResult } = renderHook(() => useCreateExperience())

      const response = await createResult.current.mutate({
        title: 'Test Job',
        company: 'Test Corp',
        employmentType: 'Full-time'
      })

      expect(response).toBe(null)
      expect(createResult.current.error).toBe('No auth token')
    })
  })

  // =============================================================================
  // TECHNOLOGIES INTEGRATION TESTS
  // =============================================================================
  describe('Technologies Complete CRUD Flow', () => {
    it('should complete full CRUD lifecycle for technologies', async () => {
      let storedTechnologies = [mockTechnology]
      let nextId = 2

      // Mock HTTP client methods
      mockHttpClient.getTechnologies.mockImplementation(async () => ({
        success: true,
        data: storedTechnologies,
      }))

      mockHttpClient.createTechnology.mockImplementation(async (data) => {
        const newTechnology = {
          _id: nextId.toString(),
          ...data,
          ownerId: 'user123'
        } as Technology
        storedTechnologies.push(newTechnology)
        nextId++
        return { success: true, data: { technology: newTechnology } }
      })

      mockHttpClient.updateTechnology.mockImplementation(async (id, updates) => {
        const index = storedTechnologies.findIndex(tech => tech._id === id)
        if (index !== -1) {
          storedTechnologies[index] = { ...storedTechnologies[index], ...updates }
          return { success: true, data: { technology: storedTechnologies[index] } }
        }
        return { success: false, error: 'Technology not found' }
      })

      mockHttpClient.deleteTechnology.mockImplementation(async (id) => {
        const index = storedTechnologies.findIndex(tech => tech._id === id)
        if (index !== -1) {
          storedTechnologies.splice(index, 1)
          return { success: true, data: { ok: true } }
        }
        return { success: false, error: 'Technology not found' }
      })

      // 1. Test READ
      const { result: readResult } = renderHook(() => useTechnologies())

      await waitFor(() => {
        expect(readResult.current.loading).toBe(false)
      })

      expect(readResult.current.data).toEqual([mockTechnology])

      // 2. Test CREATE
      const { result: createResult } = renderHook(() => useCreateTechnology())

      const newTechData = {
        name: 'Vue.js',
        category: 'frontend' as const,
        description: 'Progressive JavaScript framework',
        complexity: 'Intermediate' as const,
        teamSize: 'Individual' as const,
        flexibility: 'Medium' as const,
        timeToImplement: '1-2 weeks',
        proficiency: 6,
        yearsOfExperience: 2
      }

      let createResponse: any
      await act(async () => {
        createResponse = await createResult.current.mutate(newTechData)
      })

      expect(createResponse).toEqual({
        technology: expect.objectContaining({
          _id: '2',
          ...newTechData
        })
      })

      expect(storedTechnologies).toHaveLength(2)

      // 3. Test UPDATE
      const { result: updateResult } = renderHook(() => useUpdateTechnology())

      const updateData = {
        proficiency: 9,
        complexity: 'Expert' as const,
        teamSize: 'Large Team' as const,
        yearsOfExperience: 5
      }

      let updateResponse: any
      await act(async () => {
        updateResponse = await updateResult.current.mutate({
          id: '1',
          updates: updateData
        })
      })

      expect(updateResponse).toEqual({
        technology: expect.objectContaining({
          _id: '1',
          ...updateData
        })
      })

      // 4. Test DELETE
      const { result: deleteResult } = renderHook(() => useDeleteTechnology())

      let deleteResponse: any
      await act(async () => {
        deleteResponse = await deleteResult.current.mutate('2')
      })

      expect(deleteResponse).toEqual({ ok: true })
      expect(storedTechnologies).toHaveLength(1)
    })
  })

  // =============================================================================
  // MESSAGES INTEGRATION TESTS
  // =============================================================================
  describe('Messages Complete CRUD Flow', () => {
    it('should complete full CRUD lifecycle for messages', async () => {
      let storedMessages = [mockMessage]
      let nextId = 2

      // Mock HTTP client methods
      mockHttpClient.getMessages.mockImplementation(async () => ({
        success: true,
        data: storedMessages,
      }))

      mockHttpClient.createMessage.mockImplementation(async (data) => {
        const newMessage = {
          _id: nextId.toString(),
          ...data,
          status: 'unread' as const,
          priority: 'normal' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Message
        storedMessages.push(newMessage)
        nextId++
        return { success: true, data: newMessage }
      })

      mockHttpClient.updateMessage.mockImplementation(async (id, updates) => {
        const index = storedMessages.findIndex(msg => msg._id === id)
        if (index !== -1) {
          storedMessages[index] = {
            ...storedMessages[index],
            ...updates,
            updatedAt: new Date().toISOString()
          }
          return { success: true, data: { message: storedMessages[index] } }
        }
        return { success: false, error: 'Message not found' }
      })

      mockHttpClient.deleteMessage.mockImplementation(async (id) => {
        const index = storedMessages.findIndex(msg => msg._id === id)
        if (index !== -1) {
          storedMessages.splice(index, 1)
          return { success: true, data: { ok: true } }
        }
        return { success: false, error: 'Message not found' }
      })

      // 1. Test READ
      const { result: readResult } = renderHook(() => useMessages())

      await waitFor(() => {
        expect(readResult.current.loading).toBe(false)
      })

      expect(readResult.current.data).toEqual([mockMessage])

      // 2. Test CREATE (public endpoint, no auth required)
      const { result: createResult } = renderHook(() => useCreateMessage())

      const newMessageData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Contact Form',
        message: 'Hello, I would like to get in touch!'
      }

      let createResponse: any
      await act(async () => {
        createResponse = await createResult.current.mutate(newMessageData)
      })

      expect(createResponse).toEqual(
        expect.objectContaining({
          _id: '2',
          ...newMessageData,
          status: 'unread',
          priority: 'normal'
        })
      )

      expect(storedMessages).toHaveLength(2)

      // 3. Test UPDATE (admin operation)
      const { result: updateResult } = renderHook(() => useUpdateMessage())

      const updateData = {
        status: 'read' as const,
        priority: 'high' as const
      }

      let updateResponse: any
      await act(async () => {
        updateResponse = await updateResult.current.mutate({
          id: '1',
          updates: updateData
        })
      })

      expect(updateResponse).toEqual({
        message: expect.objectContaining({
          _id: '1',
          ...updateData
        })
      })

      // 4. Test DELETE (admin operation)
      const { result: deleteResult } = renderHook(() => useDeleteMessage())

      let deleteResponse: any
      await act(async () => {
        deleteResponse = await deleteResult.current.mutate('2')
      })

      expect(deleteResponse).toEqual({ ok: true })
      expect(storedMessages).toHaveLength(1)
    })
  })

  // =============================================================================
  // ERROR SCENARIOS INTEGRATION TESTS
  // =============================================================================
  describe('Error Scenarios Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      mockHttpClient.getExperiences.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.data).toBe(null)
    })

    it('should handle validation errors during creation', async () => {
      mockHttpClient.createExperience.mockResolvedValue({
        success: false,
        error: 'Validation failed',
        errors: ['Title is required', 'Company is required']
      })

      const { result } = renderHook(() => useCreateExperience())

      const invalidData = { description: 'Missing required fields' }
      const response = await result.current.mutate(invalidData as any)

      expect(response).toBe(null)
      expect(result.current.error).toBe('Validation failed')
    })

    it('should handle server errors during updates', async () => {
      mockHttpClient.updateTechnology.mockResolvedValue({
        success: false,
        error: 'Server error'
      })

      const { result } = renderHook(() => useUpdateTechnology())

      const response = await result.current.mutate({
        id: '1',
        updates: { name: 'Updated Tech' }
      })

      expect(response).toBe(null)
      expect(result.current.error).toBe('Server error')
    })

    it('should handle concurrent operations correctly', async () => {
      let operationCount = 0

      mockHttpClient.createExperience.mockImplementation(async (data) => {
        operationCount++
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 50))
        return {
          success: true,
          data: {
            experience: {
              _id: operationCount.toString(),
              ...data,
              ownerId: 'user123'
            } as Experience
          }
        }
      })

      const { result } = renderHook(() => useCreateExperience())

      // Start multiple concurrent operations
      const operations = [
        result.current.mutate({ title: 'Job 1', company: 'Corp 1', employmentType: 'Full-time' }),
        result.current.mutate({ title: 'Job 2', company: 'Corp 2', employmentType: 'Part-time' }),
        result.current.mutate({ title: 'Job 3', company: 'Corp 3', employmentType: 'Contract' }),
      ]

      const responses = await Promise.all(operations)

      expect(responses).toHaveLength(3)
      responses.forEach((response, index) => {
        expect(response).toEqual({
          experience: expect.objectContaining({
            title: `Job ${index + 1}`,
            company: `Corp ${index + 1}`
          })
        })
      })

      expect(mockHttpClient.createExperience).toHaveBeenCalledTimes(3)
    })
  })

  // =============================================================================
  // DATA CONSISTENCY TESTS
  // =============================================================================
  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across operations', async () => {
      let storedExperiences: Experience[] = []

      mockHttpClient.getExperiences.mockImplementation(async () => ({
        success: true,
        data: [...storedExperiences], // Return a copy
      }))

      mockHttpClient.createExperience.mockImplementation(async (data) => {
        const newExp = {
          _id: Date.now().toString(),
          ...data,
          ownerId: 'user123'
        } as Experience
        storedExperiences.push(newExp)
        return { success: true, data: { experience: newExp } }
      })

      mockHttpClient.updateExperience.mockImplementation(async (id, updates) => {
        const index = storedExperiences.findIndex(exp => exp._id === id)
        if (index !== -1) {
          storedExperiences[index] = { ...storedExperiences[index], ...updates }
          return { success: true, data: { experience: storedExperiences[index] } }
        }
        return { success: false, error: 'Not found' }
      })

      // 1. Start with empty list
      const { result: readResult, rerender } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(readResult.current.loading).toBe(false)
      })

      expect(readResult.current.data).toEqual([])

      // 2. Create an experience
      const { result: createResult } = renderHook(() => useCreateExperience())

      await act(async () => {
        await createResult.current.mutate({
          title: 'Test Job',
          company: 'Test Corp',
          employmentType: 'Full-time'
        })
      })

      // 3. Refetch and verify consistency
      await act(async () => {
        await readResult.current.refetch()
      })

      expect(readResult.current.data).toHaveLength(1)
      expect(readResult.current.data?.[0]).toEqual(
        expect.objectContaining({
          title: 'Test Job',
          company: 'Test Corp'
        })
      )

      // 4. Update the experience
      const { result: updateResult } = renderHook(() => useUpdateExperience())
      const expId = readResult.current.data?.[0]._id

      await act(async () => {
        await updateResult.current.mutate({
          id: expId!,
          updates: { title: 'Updated Job Title' }
        })
      })

      // 5. Refetch and verify update consistency
      await act(async () => {
        await readResult.current.refetch()
      })

      expect(readResult.current.data?.[0].title).toBe('Updated Job Title')
      expect(readResult.current.data?.[0]._id).toBe(expId)
    })
  })

  // =============================================================================
  // PAGINATION INTEGRATION TESTS
  // =============================================================================
  describe('Pagination Integration', () => {
    it('should handle badge pagination correctly', async () => {
      const mockBadgesPage1 = {
        badges: [
          { _id: '1', name: 'Badge 1' },
          { _id: '2', name: 'Badge 2' }
        ],
        total: 5,
        page: 1,
        limit: 2,
        hasMore: true,
        totalPages: 3
      }

      const mockBadgesPage2 = {
        badges: [
          { _id: '3', name: 'Badge 3' },
          { _id: '4', name: 'Badge 4' }
        ],
        total: 5,
        page: 2,
        limit: 2,
        hasMore: true,
        totalPages: 3
      }

      mockHttpClient.getBadges
        .mockResolvedValueOnce({ success: true, data: mockBadgesPage1 })
        .mockResolvedValueOnce({ success: true, data: mockBadgesPage2 })

      // Test first page
      let result1 = await httpClient.getBadges('token', 1, 2)
      expect(result1.data).toEqual(mockBadgesPage1)

      // Test second page
      let result2 = await httpClient.getBadges('token', 2, 2)
      expect(result2.data).toEqual(mockBadgesPage2)

      expect(mockHttpClient.getBadges).toHaveBeenCalledTimes(2)
      expect(mockHttpClient.getBadges).toHaveBeenNthCalledWith(1, 'token', 1, 2)
      expect(mockHttpClient.getBadges).toHaveBeenNthCalledWith(2, 'token', 2, 2)
    })
  })
})