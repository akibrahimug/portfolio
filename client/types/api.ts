/**
 * Shared TypeScript types for API responses and data models.
 */

export interface Project {
  _id: string
  title: string
  slug: string
  kind: 'learning' | 'frontend' | 'fullstack' | 'ai_learning'
  description?: string
  techStack: string[]
  tags: string[]
  heroImageUrl?: string | null
  visibility: 'public' | 'private'
  status: 'draft' | 'published' | 'archived'
  ownerId: string
  createdAt?: string
  updatedAt?: string
  views?: number
  likes?: number
  // Legacy fields for backward compatibility
  projectTitle?: string
  projectDescription?: string
  pictureUrl?: string
  githubUrl?: string
  liveSiteUrl?: string
}

export interface Asset {
  _id: string
  projectId: string
  ownerId: string
  path: string
  contentType: string
  size: number
  createdAt?: string
}

export interface Message {
  _id?: string
  messageID?: string
  name: string
  email: string
  message: string
  createdAt: string
  updatedAt?: string
}

export interface User {
  _id: string
  emailAddress: string
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt?: string
}

export interface Technology {
  _id: string
  name: string
  category?: string
  description?: string
  complexity?: string
  teamSize?: string
  flexibility?: string
  timeToImplement?: string
  userID?: string
}

export interface Experience {
  _id: string
  title: string
  company: string
  employmentType:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Freelance'
    | 'Internship'
    | 'Apprenticeship'
    | 'Seasonal'
  location: string
  locationType: 'On-site' | 'Remote' | 'Hybrid'
  description: string
  startDate: string
  endDate?: string
  current?: boolean
  skills?: string[]
  companyLogoUrl?: string
  linkedinUrl?: string
  userID?: string
}

export interface Certification {
  _id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  userID?: string
}

export interface Badge {
  _id: string
  name: string
  description?: string
  imageUrl?: string
  earnedDate: string
  userID?: string
}

export interface Resume {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  uploadDate: string
  userID?: string
}

export interface PersonalStatement {
  _id: string
  content: string
  userID?: string
  createdAt: string
  updatedAt?: string
}

export interface Methodology {
  _id: string
  name: string
  category: string
  description: string
  complexity: string
  teamSize: string
  flexibility: string
  timeToImplement: string
  userID?: string
}

export interface SocialMedia {
  _id: string
  platform: string
  username: string
  url: string
  userID?: string
}

export interface Avatar {
  _id: string
  imageUrl: string
  fileName: string
  uploadDate: string
  isActive?: boolean
  userID?: string
}

export interface ProjectTechStack {
  _id: string
  projectId: string
  technologies: string[]
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: string[]
}

export interface ProjectsListResponse {
  items: Project[]
  nextCursor?: string
}

export interface ProjectGetResponse {
  project: Project | null
}

// API Request types
export interface ProjectCreateRequest {
  title: string
  slug: string
  kind: Project['kind']
  description?: string
  techStack?: string[]
  tags?: string[]
  heroImageUrl?: string
  visibility?: Project['visibility']
  status?: Project['status']
}

export interface ProjectUpdateRequest {
  title?: string
  slug?: string
  kind?: Project['kind']
  description?: string
  techStack?: string[]
  tags?: string[]
  heroImageUrl?: string
  visibility?: Project['visibility']
  status?: Project['status']
}

export interface AssetUploadRequest {
  projectId: string
  filename: string
  contentType: string
  size: number
}

export interface AssetUploadResponse {
  uploadUrl: string
  objectPath: string
  headers: Record<string, string>
  expiresAt: string
}

export interface AssetConfirmRequest {
  projectId: string
  objectPath: string
  contentType: string
  size: number
}

// Stats and monitoring types
export interface StatsData {
  connections: number
  epm: number
  errorRate: number
  p95ms: number
}
