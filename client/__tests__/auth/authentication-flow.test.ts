/**
 * Comprehensive tests for authentication token handling and refresh scenarios
 */
import { renderHook, waitFor } from '@testing-library/react'
import {
  useExperiences,
  useCreateExperience,
  useTechnologies,
  useCreateTechnology,
  useMessages,
  useUpdateMessage
} from '../../hooks/useHttpApi'
import { useClerkAuth } from '../../hooks/useClerkAuth'
import { httpClient } from '../../lib/http-client'

// Mock dependencies
jest.mock('../../lib/http-client')
jest.mock('../../hooks/useClerkAuth')

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>
const mockUseClerkAuth = useClerkAuth as jest.MockedFunction<typeof useClerkAuth>

describe('Authentication Token Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // =============================================================================
  // TOKEN AVAILABILITY TESTS
  // =============================================================================
  describe('Token Availability Scenarios', () => {
    it('should handle missing token on page refresh', async () => {
      // Simulate page refresh scenario where token is temporarily unavailable
      const getAuthTokenMock = jest.fn()
        .mockResolvedValueOnce(null) // First call during initial load
        .mockResolvedValueOnce('refreshed-token') // Second call after auth loads

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      // First attempt should fail
      const { result } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No auth token')
      expect(result.current.data).toBe(null)
      expect(getAuthTokenMock).toHaveBeenCalledTimes(1)

      // Mock successful API call for retry
      mockHttpClient.getExperiences.mockResolvedValue({
        success: true,
        data: [{ _id: '1', title: 'Test Experience' }],
      })

      // Trigger refetch (simulating user retry or automatic retry)
      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual([{ _id: '1', title: 'Test Experience' }])
      expect(getAuthTokenMock).toHaveBeenCalledTimes(2)
      expect(mockHttpClient.getExperiences).toHaveBeenCalledWith('refreshed-token')
    })

    it('should handle token expiry during mutation', async () => {
      let tokenCallCount = 0
      const getAuthTokenMock = jest.fn().mockImplementation(() => {
        tokenCallCount++
        if (tokenCallCount === 1) {
          return Promise.resolve('expired-token')
        }
        return Promise.resolve('new-valid-token')
      })

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      // Mock API responses
      mockHttpClient.createExperience
        .mockResolvedValueOnce({
          success: false,
          error: '[[AUTH_ERROR_MIDDLEWARE]]-[HAPPENING ON SERVER]: expired_token'
        })
        .mockResolvedValueOnce({
          success: true,
          data: { experience: { _id: '1', title: 'New Experience' } }
        })

      const { result } = renderHook(() => useCreateExperience())

      // First attempt with expired token
      const response1 = await result.current.mutate({
        title: 'Test Job',
        company: 'Test Corp',
        employmentType: 'Full-time'
      })

      expect(response1).toBe(null)
      expect(result.current.error).toContain('expired_token')

      // Second attempt should work (user would need to trigger this manually)
      const { result: result2 } = renderHook(() => useCreateExperience())

      const response2 = await result2.current.mutate({
        title: 'Test Job',
        company: 'Test Corp',
        employmentType: 'Full-time'
      })

      expect(response2).toEqual({
        experience: { _id: '1', title: 'New Experience' }
      })
      expect(mockHttpClient.createExperience).toHaveBeenCalledTimes(2)
      expect(mockHttpClient.createExperience).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        'new-valid-token'
      )
    })

    it('should handle authentication state changes', async () => {
      // Start with authenticated state
      const getAuthTokenMock = jest.fn().mockResolvedValue('valid-token')

      const { rerender } = renderHook(() =>
        mockUseClerkAuth.mockReturnValue({
          getAuthToken: getAuthTokenMock,
          isLoaded: true,
          isSignedIn: true,
          userId: 'user123',
        })
      )

      mockHttpClient.getExperiences.mockResolvedValue({
        success: true,
        data: [{ _id: '1', title: 'Test Experience' }],
      })

      const { result } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual([{ _id: '1', title: 'Test Experience' }])
      expect(result.current.error).toBe(null)

      // Simulate user logout
      mockUseClerkAuth.mockReturnValue({
        getAuthToken: jest.fn().mockResolvedValue(null),
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      })

      rerender()

      // Try to refetch after logout
      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No auth token')
      expect(result.current.data).toBe(null)
    })
  })

  // =============================================================================
  // TOKEN VALIDATION TESTS
  // =============================================================================
  describe('Token Validation', () => {
    it('should handle invalid token format', async () => {
      mockUseClerkAuth.mockReturnValue({
        getAuthToken: jest.fn().mockResolvedValue('invalid-format'),
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      mockHttpClient.getTechnologies.mockResolvedValue({
        success: false,
        error: 'Invalid token format'
      })

      const { result } = renderHook(() => useTechnologies())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Invalid token format')
      expect(mockHttpClient.getTechnologies).toHaveBeenCalledWith('invalid-format')
    })

    it('should handle malformed JWT tokens', async () => {
      mockUseClerkAuth.mockReturnValue({
        getAuthToken: jest.fn().mockResolvedValue('not.a.jwt.token'),
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      mockHttpClient.createTechnology.mockResolvedValue({
        success: false,
        error: 'Malformed JWT'
      })

      const { result } = renderHook(() => useCreateTechnology())

      const response = await result.current.mutate({
        name: 'React',
        category: 'frontend',
        proficiency: 'advanced'
      })

      expect(response).toBe(null)
      expect(result.current.error).toBe('Malformed JWT')
    })

    it('should handle token with insufficient permissions', async () => {
      mockUseClerkAuth.mockReturnValue({
        getAuthToken: jest.fn().mockResolvedValue('limited-permissions-token'),
        isLoaded: true,
        isSignedIn: true,
        userId: 'user456', // Different user
      })

      mockHttpClient.updateMessage.mockResolvedValue({
        success: false,
        error: 'Insufficient permissions'
      })

      const { result } = renderHook(() => useUpdateMessage())

      const response = await result.current.mutate({
        id: '1',
        updates: { status: 'read' }
      })

      expect(response).toBe(null)
      expect(result.current.error).toBe('Insufficient permissions')
    })
  })

  // =============================================================================
  // CONCURRENT REQUESTS WITH TOKEN HANDLING
  // =============================================================================
  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests with same token', async () => {
      const getAuthTokenMock = jest.fn().mockResolvedValue('shared-token')

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      // Mock different successful responses for each endpoint
      mockHttpClient.getExperiences.mockResolvedValue({
        success: true,
        data: [{ _id: '1', title: 'Experience' }],
      })

      mockHttpClient.getTechnologies.mockResolvedValue({
        success: true,
        data: [{ _id: '1', name: 'React' }],
      })

      mockHttpClient.getMessages.mockResolvedValue({
        success: true,
        data: [{ _id: '1', subject: 'Test Message' }],
      })

      // Start multiple hooks concurrently
      const experiencesResult = renderHook(() => useExperiences())
      const technologiesResult = renderHook(() => useTechnologies())
      const messagesResult = renderHook(() => useMessages())

      // Wait for all to complete
      await Promise.all([
        waitFor(() => expect(experiencesResult.result.current.loading).toBe(false)),
        waitFor(() => expect(technologiesResult.result.current.loading).toBe(false)),
        waitFor(() => expect(messagesResult.result.current.loading).toBe(false)),
      ])

      // Verify all succeeded
      expect(experiencesResult.result.current.data).toEqual([{ _id: '1', title: 'Experience' }])
      expect(technologiesResult.result.current.data).toEqual([{ _id: '1', name: 'React' }])
      expect(messagesResult.result.current.data).toEqual([{ _id: '1', subject: 'Test Message' }])

      // Token should have been requested for each hook
      expect(getAuthTokenMock).toHaveBeenCalledTimes(3)

      // Each HTTP client method should have been called with the token
      expect(mockHttpClient.getExperiences).toHaveBeenCalledWith('shared-token')
      expect(mockHttpClient.getTechnologies).toHaveBeenCalledWith('shared-token')
      expect(mockHttpClient.getMessages).toHaveBeenCalledWith('shared-token')
    })

    it('should handle token refresh during multiple concurrent requests', async () => {
      let tokenCallCount = 0
      const getAuthTokenMock = jest.fn().mockImplementation(() => {
        tokenCallCount++
        if (tokenCallCount <= 2) {
          return Promise.resolve('old-token')
        }
        return Promise.resolve('refreshed-token')
      })

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      // Mock API responses - first two fail, third succeeds
      mockHttpClient.createExperience
        .mockResolvedValueOnce({
          success: false,
          error: 'Token expired'
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Token expired'
        })
        .mockResolvedValueOnce({
          success: true,
          data: { experience: { _id: '1', title: 'Created' } }
        })

      const { result } = renderHook(() => useCreateExperience())

      // First attempt fails
      const response1 = await result.current.mutate({
        title: 'Job 1',
        company: 'Corp 1',
        employmentType: 'Full-time'
      })

      expect(response1).toBe(null)
      expect(result.current.error).toBe('Token expired')

      // Second attempt also fails
      const response2 = await result.current.mutate({
        title: 'Job 2',
        company: 'Corp 2',
        employmentType: 'Full-time'
      })

      expect(response2).toBe(null)

      // Third attempt succeeds with refreshed token
      const response3 = await result.current.mutate({
        title: 'Job 3',
        company: 'Corp 3',
        employmentType: 'Full-time'
      })

      expect(response3).toEqual({
        experience: { _id: '1', title: 'Created' }
      })

      expect(getAuthTokenMock).toHaveBeenCalledTimes(3)
      expect(mockHttpClient.createExperience).toHaveBeenNthCalledWith(
        3,
        expect.any(Object),
        'refreshed-token'
      )
    })
  })

  // =============================================================================
  // ERROR RECOVERY TESTS
  // =============================================================================
  describe('Error Recovery', () => {
    it('should recover from auth errors on retry', async () => {
      let authCallCount = 0
      const getAuthTokenMock = jest.fn().mockImplementation(() => {
        authCallCount++
        if (authCallCount === 1) {
          return Promise.resolve(null) // No token initially
        }
        return Promise.resolve('valid-token') // Token available on retry
      })

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      mockHttpClient.getExperiences.mockResolvedValue({
        success: true,
        data: [{ _id: '1', title: 'Experience' }],
      })

      const { result } = renderHook(() => useExperiences())

      // Initial load should fail
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No auth token')
      expect(result.current.data).toBe(null)

      // Retry should succeed
      await result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(null)
      expect(result.current.data).toEqual([{ _id: '1', title: 'Experience' }])
      expect(getAuthTokenMock).toHaveBeenCalledTimes(2)
    })

    it('should handle persistent auth failures gracefully', async () => {
      const getAuthTokenMock = jest.fn().mockResolvedValue(null)

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: false, // User not signed in
        userId: null,
      })

      const { result } = renderHook(() => useExperiences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No auth token')
      expect(result.current.data).toBe(null)

      // Multiple retries should consistently fail
      await result.current.refetch()
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No auth token')

      await result.current.refetch()
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('No auth token')

      // Token should have been requested for each attempt
      expect(getAuthTokenMock).toHaveBeenCalledTimes(3)
    })
  })

  // =============================================================================
  // RACE CONDITION TESTS
  // =============================================================================
  describe('Race Conditions', () => {
    it('should handle token retrieval race conditions', async () => {
      let resolveTokenPromise: (token: string) => void
      const tokenPromise = new Promise<string>((resolve) => {
        resolveTokenPromise = resolve
      })

      const getAuthTokenMock = jest.fn().mockReturnValue(tokenPromise)

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      mockHttpClient.getExperiences.mockResolvedValue({
        success: true,
        data: [{ _id: '1', title: 'Experience' }],
      })

      // Start the hook
      const { result } = renderHook(() => useExperiences())

      // Should be loading while waiting for token
      expect(result.current.loading).toBe(true)

      // Resolve the token promise
      resolveTokenPromise('delayed-token')

      // Wait for completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual([{ _id: '1', title: 'Experience' }])
      expect(mockHttpClient.getExperiences).toHaveBeenCalledWith('delayed-token')
    })

    it('should handle component unmount during token fetch', async () => {
      let resolveTokenPromise: (token: string) => void
      const tokenPromise = new Promise<string>((resolve) => {
        resolveTokenPromise = resolve
      })

      const getAuthTokenMock = jest.fn().mockReturnValue(tokenPromise)

      mockUseClerkAuth.mockReturnValue({
        getAuthToken: getAuthTokenMock,
        isLoaded: true,
        isSignedIn: true,
        userId: 'user123',
      })

      const { result, unmount } = renderHook(() => useExperiences())

      expect(result.current.loading).toBe(true)

      // Unmount component before token resolves
      unmount()

      // Resolve token (this should not cause any issues)
      resolveTokenPromise('token-after-unmount')

      // Wait a bit to ensure no errors occur
      await new Promise(resolve => setTimeout(resolve, 50))

      // No assertions needed - test passes if no errors are thrown
    })
  })
})