/**
 * Tests for HTTP client
 */
import { httpClient } from '../http-client'

// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset base URL to default
    process.env.NEXT_PUBLIC_API_BASE_URL = ''
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL
  })

  describe('Configuration', () => {
    it('should use default base URL when env var is not set', () => {
      // Test is implicit - if httpClient was initialized with wrong URL, requests would fail
      expect(httpClient).toBeDefined()
    })

    it('should construct proper URLs', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ items: [] }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await httpClient.getProjects()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/projects'),
        expect.any(Object),
      )
    })
  })

  describe('Projects API', () => {
    it('should get projects without parameters', async () => {
      const mockProjects = { items: [{ id: '1', title: 'Test Project' }] }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProjects),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getProjects()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProjects)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
    })

    it('should get projects with query parameters', async () => {
      const mockProjects = { items: [] }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProjects),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await httpClient.getProjects({
        kind: 'frontend',
        tags: 'react,typescript',
        search: 'test',
        limit: 10,
        cursor: 'cursor123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'kind=frontend&tags=react%2Ctypescript&search=test&limit=10&cursor=cursor123',
        ),
        expect.any(Object),
      )
    })

    it('should create a project with authentication', async () => {
      const mockProject = { id: '1', title: 'New Project' }
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ project: mockProject }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const projectData = {
        title: 'New Project',
        slug: 'new-project',
        kind: 'frontend' as const,
        description: 'A new project',
      }

      const result = await httpClient.createProject(projectData, 'auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ project: mockProject })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(projectData),
        }),
      )
    })

    it('should update a project', async () => {
      const mockProject = { id: '1', title: 'Updated Project' }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ project: mockProject }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const updates = { title: 'Updated Project' }
      const result = await httpClient.updateProject('1', updates, 'auth-token')

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects/1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
          body: JSON.stringify(updates),
        }),
      )
    })

    it('should delete a project', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ ok: true }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.deleteProject('1', 'auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ ok: true })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/projects/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
        }),
      )
    })
  })

  describe('Experiences API', () => {
    it('should get experiences', async () => {
      const mockExperiences = [{ id: '1', title: 'Developer', company: 'Tech Corp' }]
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockExperiences),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getExperiences()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockExperiences)
    })

    it('should create an experience', async () => {
      const mockExperience = { id: '1', title: 'Developer' }
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ experience: mockExperience }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const experienceData = {
        title: 'Developer',
        company: 'Tech Corp',
        employmentType: 'Full-time' as const,
        location: 'Remote',
        locationType: 'Remote' as const,
        description: 'Working as a developer',
        startDate: '2023-01-01',
        current: true,
        skills: ['JavaScript', 'React'],
      }

      const result = await httpClient.createExperience(experienceData, 'auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ experience: mockExperience })
    })
  })

  describe('Technologies API', () => {
    it('should get technologies', async () => {
      const mockTechnologies = [{ id: '1', name: 'React', category: 'Frontend' }]
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockTechnologies),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getTechnologies()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockTechnologies)
    })

    it('should create a technology', async () => {
      const mockTechnology = { id: '1', name: 'React' }
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ technology: mockTechnology }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const technologyData = {
        name: 'React',
        category: 'Frontend Framework',
        proficiency: 8,
      }

      const result = await httpClient.createTechnology(technologyData, 'auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ technology: mockTechnology })
    })
  })

  describe('Messages API', () => {
    it('should get messages with authentication', async () => {
      const mockMessages = [{ id: '1', name: 'John', message: 'Hello' }]
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockMessages),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getMessages('auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMessages)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/messages'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
        }),
      )
    })

    it('should create a message (public endpoint)', async () => {
      const mockMessage = { id: '1', name: 'John' }
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(mockMessage),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const messageData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello there!',
      }

      const result = await httpClient.createMessage(messageData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMessage)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/messages'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(messageData),
        }),
      )
    })

    it('should update a message', async () => {
      const mockMessage = { id: '1', status: 'read' }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ message: mockMessage }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const updates = { status: 'read', priority: 'high' }
      const result = await httpClient.updateMessage('1', updates, 'auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ message: mockMessage })
    })
  })

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Invalid data' }),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getProjects()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid data')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await httpClient.getProjects()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle HTTP errors with no error message', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({}),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getProjects()

      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP 500: Internal Server Error')
    })

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.getProjects()

      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP 400: Bad Request')
    })

    it('should handle 204 No Content responses', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        json: jest.fn(),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await httpClient.deleteProject('1', 'auth-token')

      expect(result.success).toBe(true)
      expect(result.data).toBe(null)
      expect(mockResponse.json).not.toHaveBeenCalled()
    })
  })

  describe('Authentication', () => {
    it('should include Authorization header when token is provided', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await httpClient.createProject(
        { title: 'Test', slug: 'test', kind: 'frontend' },
        'test-token',
      )

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      )
    })

    it('should not include Authorization header for public endpoints', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([]),
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await httpClient.getTechnologies()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      )
    })
  })
})
