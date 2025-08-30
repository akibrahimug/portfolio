// API service for dashboard data operations
// This will be replaced with actual API calls to your backend

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export class ApiService {
  private baseUrl: string

  constructor() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'
    let normalized = raw.replace(/\/+$/, '')
    if (!normalized.endsWith('/api/v1')) normalized += '/api/v1'
    this.baseUrl = normalized
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, success: true }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Projects
  async getProjects(): Promise<ApiResponse<any[]>> {
    return this.request('/projects')
  }

  async createProject(data: any): Promise<ApiResponse<any>> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // Experiences
  async getExperiences(): Promise<ApiResponse<any[]>> {
    return this.request('/experiences')
  }

  async createExperience(data: any): Promise<ApiResponse<any>> {
    return this.request('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExperience(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExperience(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/experiences/${id}`, {
      method: 'DELETE',
    })
  }

  // Certifications
  async getCertifications(): Promise<ApiResponse<any[]>> {
    return this.request('/certifications')
  }

  async createCertification(data: any): Promise<ApiResponse<any>> {
    return this.request('/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCertification(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCertification(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/certifications/${id}`, {
      method: 'DELETE',
    })
  }

  // Badges
  async getBadges(): Promise<ApiResponse<any[]>> {
    return this.request('/badges')
  }

  async createBadge(data: any): Promise<ApiResponse<any>> {
    return this.request('/badges', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBadge(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/badges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBadge(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/badges/${id}`, {
      method: 'DELETE',
    })
  }

  // Technologies
  async getTechnologies(): Promise<ApiResponse<any[]>> {
    return this.request('/technologies')
  }

  async createTechnology(data: any): Promise<ApiResponse<any>> {
    return this.request('/technologies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTechnology(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/technologies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTechnology(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/technologies/${id}`, {
      method: 'DELETE',
    })
  }

  // Profile
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/profile')
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Messages
  async getMessages(): Promise<ApiResponse<any[]>> {
    return this.request('/messages')
  }

  async updateMessage(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMessage(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/messages/${id}`, {
      method: 'DELETE',
    })
  }

  // Resumes
  async getResumes(): Promise<ApiResponse<any[]>> {
    return this.request('/resumes')
  }

  async createResume(data: any): Promise<ApiResponse<any>> {
    return this.request('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateResume(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteResume(id: string): Promise<ApiResponse<boolean>> {
    return this.request(`/resumes/${id}`, {
      method: 'DELETE',
    })
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/dashboard/stats')
  }

  // Recent Activity
  async getRecentActivity(): Promise<ApiResponse<any[]>> {
    return this.request('/dashboard/activity')
  }
}

// Export a singleton instance
export const apiService = new ApiService()
