/**
 * Shared TypeScript types for API responses and data models.
 */

export interface Project {
  _id: string
  slug?: string
  title: string
  category?: string
  description?: string
  techStack: string[]
  technologyIds?: string[]
  heroImageUrl?: string | null
  liveUrl?: string | null
  githubUrl?: string | null
  repoUrl?: string | null
  gradient?: string | null
  hasPreview?: boolean
  previewType?:
    | 'image'
    | 'components'
    | 'visualization'
    | 'platform'
    | 'game'
    | 'music'
    | 'ar'
    | 'chart'
    | 'dashboard'
    | 'ecommerce'
    | 'other'
  duration?: string | null
  teamSize?: string | null
  importance?: 'high' | 'medium' | 'low'
  status?: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private'
  ownerId: string
  createdAt?: string
  updatedAt?: string
  views?: number
  likes?: number
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
  _id: string
  name: string
  email: string
  subject?: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  ipAddress?: string
  userAgent?: string
  source: string
  createdAt: string
  updatedAt: string
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
  category: string
  description: string
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  teamSize: 'Individual' | 'Small Team' | 'Large Team' | 'Any'
  flexibility: 'Low' | 'Medium' | 'High'
  timeToImplement: string
  proficiency: number
  yearsOfExperience: number
  iconUrl?: string
  ownerId: string
  createdAt: string
  updatedAt: string
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
  endDate?: string | null
  current: boolean
  skills: string[]
  companyLogoUrl?: string
  linkedinUrl?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type ExperienceCreateRequest = Omit<
  Experience,
  '_id' | 'ownerId' | 'createdAt' | 'updatedAt'
>

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
  slug?: string
  category?: string
  description?: string
  techStack?: string[]
  technologyIds?: string[]
  heroImageUrl?: string
  liveUrl?: string
  githubUrl?: string
  repoUrl?: string
  gradient?: string
  hasPreview?: boolean
  previewType?: Project['previewType']
  duration?: string
  teamSize?: string
  importance?: 'high' | 'medium' | 'low'
  status?: 'draft' | 'published' | 'archived'
  visibility?: Project['visibility']
}

export interface ProjectUpdateRequest {
  title?: string
  slug?: string
  category?: string
  description?: string
  techStack?: string[]
  technologyIds?: string[]
  heroImageUrl?: string
  liveUrl?: string
  githubUrl?: string
  repoUrl?: string
  gradient?: string
  hasPreview?: boolean
  previewType?: Project['previewType']
  duration?: string
  teamSize?: string
  status?: 'draft' | 'published' | 'archived'
  importance?: 'high' | 'medium' | 'low'
  visibility?: Project['visibility']
}

export interface AssetUploadRequest {
  projectId?: string
  filename: string
  contentType: string
  size: number
  assetType?: string
  folder?: string
}

export interface AssetUploadResponse {
  uploadUrl: string
  objectPath: string
  headers: Record<string, string>
  expiresAt: string
  assetId?: string
}

export interface AssetConfirmRequest {
  projectId?: string
  objectPath: string
  contentType: string
  size: number
  assetType?: string
}

export interface AssetConfirmResponse {
  asset: Asset
  publicUrl: string
  viewUrl: string
}

// Stats and monitoring types
export interface StatsData {
  connections: number
  epm: number
  errorRate: number
  p95ms: number
}
