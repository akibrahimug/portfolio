import type { Experience, ExperienceCreateRequest } from '@/types/api'

/**
 * Test factory for Experience entities. Returns a fully populated Experience
 * with sensible defaults; callers may override any subset of fields.
 */
export function makeExperience(overrides: Partial<Experience> = {}): Experience {
  return {
    _id: 'exp-1',
    title: 'Software Engineer',
    company: 'Acme Corp',
    employmentType: 'Full-time',
    location: 'Remote',
    locationType: 'Remote',
    description: 'Built things.',
    startDate: '2023-01-01',
    endDate: null,
    current: true,
    skills: ['TypeScript'],
    companyLogoUrl: undefined,
    linkedinUrl: undefined,
    ownerId: 'user-1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/**
 * Test factory for the create request payload (no server-managed fields).
 */
export function makeExperienceCreateRequest(
  overrides: Partial<ExperienceCreateRequest> = {},
): ExperienceCreateRequest {
  return {
    title: 'Software Engineer',
    company: 'Acme Corp',
    employmentType: 'Full-time',
    location: 'Remote',
    locationType: 'Remote',
    description: 'Built things.',
    startDate: '2023-01-01',
    endDate: null,
    current: true,
    skills: ['TypeScript'],
    companyLogoUrl: undefined,
    linkedinUrl: undefined,
    ...overrides,
  }
}
