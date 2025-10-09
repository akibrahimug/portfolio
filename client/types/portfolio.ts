export interface PortfolioProject {
  id: string
  title: string
  description: string
  techStack: string[]
  duration: string
  teamSize: string
  importance: 'high' | 'medium' | 'low'
  liveUrl: string
  repoUrl: string
  gradient: string
  hasPreview?: boolean
  heroImageUrl?: string
  category: 'AI Learning/Exploration' | 'Frontend/UI/UX' | 'Full Stack' | 'Fun/Sandbox'
}

export type PortfolioCategoryMap = Record<
  'AI Learning/Exploration' | 'Frontend/UI/UX' | 'Full Stack' | 'Fun/Sandbox',
  PortfolioProject[]
>
