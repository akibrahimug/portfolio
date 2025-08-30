import { z } from 'zod'

// Base schemas
export const BaseEntitySchema = z.object({
  _id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Project schemas
export const ProjectVisibilitySchema = z.enum(['public', 'private'])

export const ProjectSchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  // slug/kind removed; use category
  description: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  heroImageUrl: z.string().nullable().optional(),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gradient: z.string().optional(),
  hasPreview: z.boolean().optional(),
  category: z.string().optional(),
  duration: z.string().optional(),
  teamSize: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']).optional(),
  visibility: ProjectVisibilitySchema.default('public'),
  ownerId: z.string(),
  views: z.number().optional(),
  likes: z.number().optional(),
})

export const ProjectCreateSchema = ProjectSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true,
})
export const ProjectUpdateSchema = ProjectSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  likes: true,
})

// Experience schemas
export const ExperienceSchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  company: z
    .string()
    .min(1, 'Company is required')
    .max(100, 'Company must be less than 100 characters'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  technologies: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  ownerId: z.string(),
})

export const ExperienceCreateSchema = ExperienceSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})
export const ExperienceUpdateSchema = ExperienceSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Certification schemas
export const CertificationSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  issuer: z
    .string()
    .min(1, 'Issuer is required')
    .max(100, 'Issuer must be less than 100 characters'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  ownerId: z.string(),
})

export const CertificationCreateSchema = CertificationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})
export const CertificationUpdateSchema = CertificationSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Badge schemas
export const BadgeSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  issuer: z
    .string()
    .min(1, 'Issuer is required')
    .max(100, 'Issuer must be less than 100 characters'),
  issueDate: z.string().min(1, 'Issue date is required'),
  badgeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  category: z.string().optional(),
  ownerId: z.string(),
})

export const BadgeCreateSchema = BadgeSchema.omit({ _id: true, createdAt: true, updatedAt: true })
export const BadgeUpdateSchema = BadgeSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Technology schemas
export const TechnologySchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  iconUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience must be non-negative').optional(),
  ownerId: z.string(),
})

export const TechnologyCreateSchema = TechnologySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})
export const TechnologyUpdateSchema = TechnologySchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Profile schemas
export const ProfileSchema = BaseEntitySchema.extend({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Must be a valid email'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  bio: z.string().min(1, 'Bio is required').max(500, 'Bio must be less than 500 characters'),
  location: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  avatarUrl: z.string().optional(),
  ownerId: z.string(),
})

export const ProfileCreateSchema = ProfileSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})
export const ProfileUpdateSchema = ProfileSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Message schemas
export const MessageSchema = BaseEntitySchema.extend({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Must be a valid email'),
  company: z.string().optional(),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters'),
  status: z.enum(['unread', 'read', 'replied', 'archived']).default('unread'),
  ownerId: z.string(),
})

export const MessageCreateSchema = MessageSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
})
export const MessageUpdateSchema = MessageSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Resume schemas
export const ResumeSchema = BaseEntitySchema.extend({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  isPublic: z.boolean().default(true),
  ownerId: z.string(),
})

export const ResumeCreateSchema = ResumeSchema.omit({ _id: true, createdAt: true, updatedAt: true })
export const ResumeUpdateSchema = ResumeSchema.partial().omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

// Form schemas for dynamic forms
export const FormFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum([
    'text',
    'email',
    'password',
    'number',
    'textarea',
    'select',
    'multiselect',
    'date',
    'checkbox',
    'file',
    'url',
    'image',
  ]),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
})

export const FormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(FormFieldSchema),
  submitText: z.string().default('Submit'),
  cancelText: z.string().default('Cancel'),
})

// Export types
export type Project = z.infer<typeof ProjectSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>

export type Experience = z.infer<typeof ExperienceSchema>
export type ExperienceCreate = z.infer<typeof ExperienceCreateSchema>
export type ExperienceUpdate = z.infer<typeof ExperienceUpdateSchema>

export type Certification = z.infer<typeof CertificationSchema>
export type CertificationCreate = z.infer<typeof CertificationCreateSchema>
export type CertificationUpdate = z.infer<typeof CertificationUpdateSchema>

export type Badge = z.infer<typeof BadgeSchema>
export type BadgeCreate = z.infer<typeof BadgeCreateSchema>
export type BadgeUpdate = z.infer<typeof BadgeUpdateSchema>

export type Technology = z.infer<typeof TechnologySchema>
export type TechnologyCreate = z.infer<typeof TechnologyCreateSchema>
export type TechnologyUpdate = z.infer<typeof TechnologyUpdateSchema>

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileCreate = z.infer<typeof ProfileCreateSchema>
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>

export type Message = z.infer<typeof MessageSchema>
export type MessageCreate = z.infer<typeof MessageCreateSchema>
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>

export type Resume = z.infer<typeof ResumeSchema>
export type ResumeCreate = z.infer<typeof ResumeCreateSchema>
export type ResumeUpdate = z.infer<typeof ResumeUpdateSchema>

export type FormField = z.infer<typeof FormFieldSchema>
export type Form = z.infer<typeof FormSchema>
