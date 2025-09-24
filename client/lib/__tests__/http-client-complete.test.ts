/**
 * Comprehensive tests for HTTP Client CRUD operations
 */
import { httpClient } from '../http-client'
import type {
  ProjectCreateRequest,
  ProjectUpdateRequest,
  Experience,
  ExperienceCreateRequest,
  Technology,
  Message,
} from '../../types/api'

// Mock fetch globally
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('HTTP Client CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset base URL
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:5000'
  })

  // =============================================================================
  // PROJECTS CRUD
  // =============================================================================
  describe('Projects CRUD', () => {
    describe('getProjects', () => {
      it('should fetch projects without parameters', async () => {
        const mockResponse = {
          success: true,
          data: {
            items: [
              {
                _id: '1',
                title: 'Test Project',
                slug: 'test-project',
                kind: 'frontend',
                techStack: ['react'],
                tags: ['web'],
                visibility: 'public',
                status: 'published',
                ownerId: 'user123'
              }
            ]
          }
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const result = await httpClient.getProjects()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/projects',
          expect.objectContaining({
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })
        )
        expect(result).toEqual(mockResponse)
      })

      it('should fetch projects with parameters', async () => {
        const mockResponse = { success: true, data: { items: [] } }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const params = {
          category: 'frontend',
          search: 'react',
          limit: 10,
          cursor: 'abc123'
        }

        await httpClient.getProjects(params)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/projects?category=frontend&search=react&limit=10&cursor=abc123',
          expect.any(Object)
        )
      })

      it('should handle fetch errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await httpClient.getProjects()

        expect(result).toEqual({
          success: false,
          error: 'Network error',
        })
      })

      it('should handle HTTP error responses', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({ error: 'Projects not found' }),
        } as Response)

        const result = await httpClient.getProjects()

        expect(result).toEqual({
          success: false,
          error: 'Projects not found',
        })
      })
    })

    describe('createProject', () => {
      it('should create project successfully', async () => {
        const projectData: ProjectCreateRequest = {
          title: 'New Project',
          slug: 'new-project',
          kind: 'frontend',
          description: 'A test project',
          techStack: ['react', 'typescript'],
          tags: ['web', 'frontend'],
          visibility: 'public',
          status: 'draft'
        }

        const mockResponse = {
          success: true,
          data: { project: { _id: '123', ...projectData, ownerId: 'user123' } }
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const result = await httpClient.createProject(projectData, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/projects',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer auth-token',
            },
            body: JSON.stringify({ version: 'v1', data: projectData })
          })
        )
        expect(result).toEqual(mockResponse)
      })
    })

    describe('updateProject', () => {
      it('should update project successfully', async () => {
        const updates: ProjectUpdateRequest = {
          title: 'Updated Project',
          description: 'Updated description'
        }

        const mockResponse = {
          success: true,
          data: { project: { _id: '123', ...updates } }
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const result = await httpClient.updateProject('123', updates, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/projects/123',
          expect.objectContaining({
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer auth-token',
            },
            body: JSON.stringify({ version: 'v1', id: '123', data: updates })
          })
        )
        expect(result).toEqual(mockResponse)
      })
    })

    describe('deleteProject', () => {
      it('should delete project successfully', async () => {
        const mockResponse = { success: true, data: { ok: true } }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const result = await httpClient.deleteProject('123', 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/projects/123',
          expect.objectContaining({
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer auth-token',
            },
            body: JSON.stringify({ version: 'v1', id: '123' })
          })
        )
        expect(result).toEqual(mockResponse)
      })
    })
  })

  // =============================================================================
  // EXPERIENCES CRUD
  // =============================================================================
  describe('Experiences CRUD', () => {
    describe('getExperiences', () => {
      it('should fetch experiences with auth token', async () => {
        const mockExperiences: Experience[] = [
          {
            _id: '1',
            title: 'Software Engineer',
            company: 'Tech Corp',
            employmentType: 'Full-time',
            location: 'New York, NY',
            locationType: 'Remote',
            description: 'Building software',
            startDate: '2022-01',
            endDate: '2024-01',
            current: false,
            skills: ['React', 'Node.js'],
            companyLogoUrl: 'https://example.com/logo.png',
            linkedinUrl: 'https://linkedin.com/company/tech-corp',
            ownerId: 'user123'
          }
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockExperiences }),
        } as Response)

        const result = await httpClient.getExperiences('auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/experiences',
          expect.objectContaining({
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer auth-token',
            }
          })
        )
        expect(result.data).toEqual(mockExperiences)
      })
    })

    describe('createExperience', () => {
      it('should create experience successfully', async () => {
        const experienceData: ExperienceCreateRequest = {
          title: 'Senior Developer',
          company: 'New Corp',
          employmentType: 'Full-time',
          location: 'San Francisco, CA',
          locationType: 'Hybrid',
          description: 'Leading development team',
          startDate: '2024-01',
          current: true,
          skills: ['React', 'TypeScript', 'Node.js']
        }

        const mockResponse = {
          success: true,
          data: { experience: { _id: '456', ...experienceData, ownerId: 'user123' } }
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)

        const result = await httpClient.createExperience(experienceData, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/experiences',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer auth-token',
            },
            body: JSON.stringify(experienceData)
          })
        )
        expect(result).toEqual(mockResponse)
      })

      it('should handle validation errors', async () => {
        const invalidData = { title: 'Test' } as ExperienceCreateRequest

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: 'Company is required',
            errors: ['company is required']
          }),
        } as Response)

        const result = await httpClient.createExperience(invalidData, 'auth-token')

        expect(result.success).toBe(false)
        expect(result.error).toBe('Company is required')
      })
    })

    describe('updateExperience', () => {
      it('should update experience successfully', async () => {
        const updates = { title: 'Lead Developer', current: true }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { experience: { _id: '1', ...updates } }
          }),
        } as Response)

        const result = await httpClient.updateExperience('1', updates, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/experiences/1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updates)
          })
        )
        expect(result.success).toBe(true)
      })
    })

    describe('deleteExperience', () => {
      it('should delete experience successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { ok: true } }),
        } as Response)

        const result = await httpClient.deleteExperience('1', 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/experiences/1',
          expect.objectContaining({
            method: 'DELETE'
          })
        )
        expect(result.success).toBe(true)
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
      description: 'JavaScript library',
      iconUrl: 'https://example.com/react.png',
      websiteUrl: 'https://reactjs.org',
      experience: 36,
      lastUsed: '2024-01',
      featured: true,
      ownerId: 'user123'
    }

    describe('getTechnologies', () => {
      it('should fetch technologies successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockTechnology]
          }),
        } as Response)

        const result = await httpClient.getTechnologies('auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/technologies',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer auth-token',
            })
          })
        )
        expect(result.data).toEqual([mockTechnology])
      })
    })

    describe('createTechnology', () => {
      it('should create technology successfully', async () => {
        const techData = {
          name: 'Vue.js',
          category: 'frontend',
          proficiency: 'intermediate'
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { technology: { ...mockTechnology, ...techData } }
          }),
        } as Response)

        const result = await httpClient.createTechnology(techData, 'auth-token')

        expect(result.success).toBe(true)
        expect(result.data?.technology).toEqual({ ...mockTechnology, ...techData })
      })
    })

    describe('updateTechnology', () => {
      it('should update technology successfully', async () => {
        const updates = { proficiency: 'expert', featured: true }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { technology: { ...mockTechnology, ...updates } }
          }),
        } as Response)

        const result = await httpClient.updateTechnology('1', updates, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/technologies/1',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(updates)
          })
        )
        expect(result.success).toBe(true)
      })
    })

    describe('deleteTechnology', () => {
      it('should delete technology successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { ok: true } }),
        } as Response)

        const result = await httpClient.deleteTechnology('1', 'auth-token')

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ ok: true })
      })
    })
  })

  // =============================================================================
  // BADGES
  // =============================================================================
  describe('Badges', () => {
    describe('getBadges', () => {
      it('should fetch badges with pagination', async () => {
        const mockBadgesResponse = {
          success: true,
          data: {
            badges: [
              {
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
            ],
            total: 1,
            page: 1,
            limit: 50,
            hasMore: false,
            totalPages: 1
          }
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBadgesResponse),
        } as Response)

        const result = await httpClient.getBadges('auth-token', 1, 50)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/badges?page=1&limit=50',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer auth-token',
            })
          })
        )
        expect(result).toEqual(mockBadgesResponse)
      })

      it('should handle empty badges response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              badges: [],
              total: 0,
              page: 1,
              limit: 50,
              hasMore: false,
              totalPages: 0
            }
          }),
        } as Response)

        const result = await httpClient.getBadges('auth-token')

        expect(result.success).toBe(true)
        expect(result.data?.badges).toHaveLength(0)
      })
    })

    describe('deleteBadge', () => {
      it('should delete badge successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { ok: true } }),
        } as Response)

        const result = await httpClient.deleteBadge('badge-filename.png', 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/badges/badge-filename.png',
          expect.objectContaining({
            method: 'DELETE'
          })
        )
        expect(result.success).toBe(true)
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
      subject: 'Test Subject',
      message: 'Test message content',
      status: 'unread',
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    describe('getMessages', () => {
      it('should fetch messages with auth token', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [mockMessage]
          }),
        } as Response)

        const result = await httpClient.getMessages('auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/messages',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer auth-token',
            })
          })
        )
        expect(result.data).toEqual([mockMessage])
      })
    })

    describe('createMessage', () => {
      it('should create message without auth token', async () => {
        const messageData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'Contact Form',
          message: 'Hello there!'
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { ...mockMessage, ...messageData }
          }),
        } as Response)

        const result = await httpClient.createMessage(messageData)

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/messages',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(messageData)
          })
        )
        // Should NOT have Authorization header for public endpoint
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.not.objectContaining({
            headers: expect.objectContaining({
              'Authorization': expect.any(String)
            })
          })
        )
      })
    })

    describe('updateMessage', () => {
      it('should update message status', async () => {
        const updates = { status: 'read', priority: 'high' }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { message: { ...mockMessage, ...updates } }
          }),
        } as Response)

        const result = await httpClient.updateMessage('1', updates, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/messages/1',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(updates)
          })
        )
        expect(result.success).toBe(true)
      })
    })

    describe('deleteMessage', () => {
      it('should delete message successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { ok: true } }),
        } as Response)

        const result = await httpClient.deleteMessage('1', 'auth-token')

        expect(result.success).toBe(true)
      })
    })
  })

  // =============================================================================
  // RESUMES
  // =============================================================================
  describe('Resumes', () => {
    describe('getResumes', () => {
      it('should fetch resumes list', async () => {
        const mockResumes = {
          items: [
            {
              _id: '1',
              filename: 'resume.pdf',
              publicUrl: 'https://storage.googleapis.com/bucket/resume.pdf',
              size: 123456,
              contentType: 'application/pdf',
              timeCreated: '2024-01-01T00:00:00Z',
              isPublic: true,
              name: 'My Resume'
            }
          ]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockResumes }),
        } as Response)

        const result = await httpClient.getResumes()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/resumes',
          expect.any(Object)
        )
        expect(result.data).toEqual(mockResumes)
      })
    })

    describe('getLatestResume', () => {
      it('should fetch latest resume', async () => {
        const mockResume = {
          _id: '1',
          filename: 'latest-resume.pdf',
          publicUrl: 'https://storage.googleapis.com/bucket/latest-resume.pdf'
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { resume: mockResume } }),
        } as Response)

        const result = await httpClient.getLatestResume()

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/resumes/latest',
          expect.any(Object)
        )
        expect(result.data).toEqual({ resume: mockResume })
      })
    })

    describe('deleteResume', () => {
      it('should delete resume successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { ok: true } }),
        } as Response)

        const result = await httpClient.deleteResume('1', 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/resumes/1',
          expect.objectContaining({
            method: 'DELETE'
          })
        )
        expect(result.success).toBe(true)
      })
    })

    describe('editResume', () => {
      it('should edit resume metadata', async () => {
        const updates = { isPublic: false, name: 'Private Resume' }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { resume: { _id: '1', ...updates } }
          }),
        } as Response)

        const result = await httpClient.editResume('1', updates, 'auth-token')

        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/v1/resumes/1',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(updates)
          })
        )
        expect(result.success).toBe(true)
      })
    })
  })

  // =============================================================================
  // ERROR HANDLING
  // =============================================================================
  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid token' }),
      } as Response)

      const result = await httpClient.getExperiences('invalid-token')

      expect(result).toEqual({
        success: false,
        error: 'Invalid token'
      })
    })

    it('should handle 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ error: 'Access denied' }),
      } as Response)

      const result = await httpClient.deleteProject('1', 'user-token')

      expect(result).toEqual({
        success: false,
        error: 'Access denied'
      })
    })

    it('should handle 404 Not Found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Resource not found' }),
      } as Response)

      const result = await httpClient.updateExperience('nonexistent', {}, 'auth-token')

      expect(result).toEqual({
        success: false,
        error: 'Resource not found'
      })
    })

    it('should handle 422 Validation Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({
          error: 'Validation failed',
          errors: ['Title is required', 'Email must be valid']
        }),
      } as Response)

      const result = await httpClient.createExperience({} as ExperienceCreateRequest, 'auth-token')

      expect(result).toEqual({
        success: false,
        error: 'Validation failed',
        errors: ['Title is required', 'Email must be valid']
      })
    })

    it('should handle 429 Rate Limiting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      } as Response)

      const result = await httpClient.createMessage({
        name: 'Spam User',
        email: 'spam@example.com',
        subject: 'Spam',
        message: 'Spam message'
      })

      expect(result).toEqual({
        success: false,
        error: 'Rate limit exceeded'
      })
    })

    it('should handle 500 Internal Server Error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' }),
      } as Response)

      const result = await httpClient.getProjects()

      expect(result).toEqual({
        success: false,
        error: 'Server error'
      })
    })

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      const result = await httpClient.getProjects()

      expect(result).toEqual({
        success: false,
        error: 'HTTP 400: Bad Request'
      })
    })

    it('should handle network timeouts', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch timeout'))

      const result = await httpClient.getProjects()

      expect(result).toEqual({
        success: false,
        error: 'fetch timeout'
      })
    })

    it('should handle CORS errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'))

      const result = await httpClient.getProjects()

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      })
    })
  })

  // =============================================================================
  // BASE URL CONFIGURATION
  // =============================================================================
  describe('Base URL Configuration', () => {
    it('should use environment variable for base URL', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com'

      // Create new client instance to pick up env change
      const newClient = new (httpClient.constructor as any)()

      expect(newClient['baseUrl']).toBe('https://api.example.com/api/v1')
    })

    it('should default to localhost if no env var', () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL

      const newClient = new (httpClient.constructor as any)()

      expect(newClient['baseUrl']).toBe('http://localhost:5000/api/v1')
    })

    it('should handle trailing slashes in base URL', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com/'

      const newClient = new (httpClient.constructor as any)()

      expect(newClient['baseUrl']).toBe('https://api.example.com/api/v1')
    })
  })

  // =============================================================================
  // RESPONSE HANDLING
  // =============================================================================
  describe('Response Handling', () => {
    it('should handle 204 No Content responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve(),
      } as Response)

      const result = await httpClient.deleteProject('1', 'auth-token')

      expect(result).toEqual({
        success: true,
        data: null
      })
    })

    it('should handle successful responses with data', async () => {
      const responseData = { message: 'Success', id: '123' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseData),
      } as Response)

      const result = await httpClient.getProjects()

      expect(result).toEqual({
        success: true,
        data: responseData
      })
    })
  })
})