/**
 * Custom hook for Clerk authentication integration
 */
import { useAuth } from '@clerk/nextjs'

export function useClerkAuth() {
  // Mock implementation until Clerk is properly installed
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()

  const getAuthToken = async (): Promise<string | null> => {
    // TODO: Replace with actual Clerk implementation when Node.js is updated
    return 'mock-auth-token'
  }

  return {
    getAuthToken,
    isLoaded: true, // Mock as loaded
    isSignedIn: true, // Mock as signed in
    userId: 'mock-user-id',
  }
}
