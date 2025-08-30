/**
 * Tests for useClerkAuth hook
 */
import { renderHook } from '@testing-library/react'
import { useAuth } from '@clerk/nextjs'
import { useClerkAuth } from '../useClerkAuth'

// Mock Clerk's useAuth hook
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('useClerkAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return auth token when user is signed in', async () => {
    const mockToken = 'mock-jwt-token'
    const mockGetToken = jest.fn().mockResolvedValue(mockToken)

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
      userId: 'user123',
    } as any)

    const { result } = renderHook(() => useClerkAuth())

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(true)
    expect(result.current.userId).toBe('user123')

    const token = await result.current.getAuthToken()
    expect(token).toBe(mockToken)
    expect(mockGetToken).toHaveBeenCalledTimes(1)
  })

  it('should return null when user is not signed in', async () => {
    mockUseAuth.mockReturnValue({
      getToken: jest.fn(),
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    } as any)

    const { result } = renderHook(() => useClerkAuth())

    expect(result.current.isSignedIn).toBe(false)

    const token = await result.current.getAuthToken()
    expect(token).toBe(null)
  })

  it('should handle token retrieval errors gracefully', async () => {
    const mockGetToken = jest.fn().mockRejectedValue(new Error('Token retrieval failed'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
      userId: 'user123',
    } as any)

    const { result } = renderHook(() => useClerkAuth())

    const token = await result.current.getAuthToken()

    expect(token).toBe(null)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to get auth token:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })

  it('should return loading state correctly', () => {
    mockUseAuth.mockReturnValue({
      getToken: jest.fn(),
      isLoaded: false,
      isSignedIn: false,
      userId: null,
    } as any)

    const { result } = renderHook(() => useClerkAuth())

    expect(result.current.isLoaded).toBe(false)
    expect(result.current.isSignedIn).toBe(false)
    expect(result.current.userId).toBe(null)
  })

  it('should handle undefined token response', async () => {
    const mockGetToken = jest.fn().mockResolvedValue(undefined)

    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
      isLoaded: true,
      isSignedIn: true,
      userId: 'user123',
    } as any)

    const { result } = renderHook(() => useClerkAuth())

    const token = await result.current.getAuthToken()
    expect(token).toBe(undefined)
  })

  it('should pass through all auth states from Clerk', () => {
    const mockAuthState = {
      getToken: jest.fn(),
      isLoaded: true,
      isSignedIn: true,
      userId: 'test-user-456',
      sessionId: 'session-123',
      orgId: 'org-789',
    }

    mockUseAuth.mockReturnValue(mockAuthState as any)

    const { result } = renderHook(() => useClerkAuth())

    expect(result.current.isLoaded).toBe(mockAuthState.isLoaded)
    expect(result.current.isSignedIn).toBe(mockAuthState.isSignedIn)
    expect(result.current.userId).toBe(mockAuthState.userId)
  })
})
