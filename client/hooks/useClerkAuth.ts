/**
 * Custom hook for Clerk authentication integration
 */
import { useAuth } from '@clerk/nextjs'

export function useClerkAuth() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()

  const getAuthToken = async (): Promise<string | null> => {
    if (!isSignedIn) {
      return null
    }

    try {
      // Get the JWT token from Clerk
      const token = await getToken()
      return token
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  return {
    getAuthToken,
    isLoaded,
    isSignedIn,
    userId,
  }
}
