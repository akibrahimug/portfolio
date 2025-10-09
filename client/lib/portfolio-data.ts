import type { ApiResponse } from '@/types/api'
import type { PortfolioCategoryMap, PortfolioProject } from '@/types/portfolio'
import { httpClient } from './http-client'

export async function fetchPortfolioData(): Promise<ApiResponse<PortfolioCategoryMap>> {
  try {
    
    // Fetch real projects from API
    const response = await httpClient.getProjects()

    if (!response.success) {
      console.warn('⚠️ API call failed:', response.error)
      // Return empty categories instead of dummy data when API fails
      return { success: true, data: {
        'AI Learning/Exploration': [],
        'Frontend/UI/UX': [],
        'Full Stack': [],
        'Fun/Sandbox': [],
      }}
    }

    if (!response.data?.items) {
      console.warn('⚠️ No items in API response')
      // Return empty categories instead of dummy data when no items
      return { success: true, data: {
        'AI Learning/Exploration': [],
        'Frontend/UI/UX': [],
        'Full Stack': [],
        'Fun/Sandbox': [],
      }}
    }

    // Transform API projects to portfolio format and group by category
    const allProjects = response.data.items

    
    const filteredProjects = allProjects.filter(project => {
      const isPublic = project.visibility === 'public'
      const isPublished = project.status === 'published'
      return isPublic && isPublished
    })
    
    const projects = filteredProjects
      .map(transformToPortfolioProject)
      .filter(project => project !== null) as PortfolioProject[]

    // Group projects by category
    const categorizedProjects: PortfolioCategoryMap = {
      'AI Learning/Exploration': projects.filter(p => p.category === 'AI Learning/Exploration'),
      'Frontend/UI/UX': projects.filter(p => p.category === 'Frontend/UI/UX'), 
      'Full Stack': projects.filter(p => p.category === 'Full Stack'),
      'Fun/Sandbox': projects.filter(p => p.category === 'Fun/Sandbox'),
    }

    // Only show real projects, don't fill with dummy data
    const finalData = categorizedProjects
    
    
    return Promise.resolve({ success: true, data: finalData })
  } catch (error) {
    console.warn('Failed to fetch portfolio projects:', error)
    // Return empty categories instead of dummy data when there's an error
    return { success: true, data: {
      'AI Learning/Exploration': [],
      'Frontend/UI/UX': [],
      'Full Stack': [],
      'Fun/Sandbox': [],
    }}
  }
}

function transformToPortfolioProject(apiProject: any): PortfolioProject | null {
  if (!apiProject.title || !apiProject.category) return null

  return {
    id: apiProject._id || apiProject.id,
    title: apiProject.title,
    description: apiProject.description || 'No description available',
    techStack: apiProject.techStack || [],
    duration: apiProject.duration || 'Not specified',
    teamSize: apiProject.teamSize || 'Not specified',
    importance: apiProject.importance || 'medium',
    liveUrl: apiProject.liveUrl || '#',
    repoUrl: apiProject.repoUrl || apiProject.githubUrl || '#',
    gradient: apiProject.gradient || 'from-gray-700 to-gray-800',
    hasPreview: apiProject.hasPreview || false,
    heroImageUrl: apiProject.heroImageUrl || undefined,
    category: apiProject.category as PortfolioProject['category'],
  }
}

function fillWithDummyData(realData: PortfolioCategoryMap): PortfolioCategoryMap {
  const dummyData = getDummyPortfolioData().data!
  
  // For each category, if it's empty or has fewer than 2 projects, add some dummy data
  const categories = Object.keys(realData) as (keyof PortfolioCategoryMap)[]
  
  categories.forEach(category => {
    const realProjects = realData[category] || []
    const dummyProjects = dummyData[category] || []
    
    // Keep real projects first, then add dummy projects to fill gaps
    if (realProjects.length === 0) {
      realData[category] = dummyProjects
    } else if (realProjects.length < 2) {
      // Mix real with dummy, but mark dummy projects clearly
      const filteredDummy = dummyProjects
        .slice(0, 3 - realProjects.length)
        .map(dummy => ({
          ...dummy,
          id: `dummy-${dummy.id}`,
          title: `${dummy.title} (Demo)`,
        }))
      realData[category] = [...realProjects, ...filteredDummy]
    }
  })
  
  return realData
}

function getDummyPortfolioData(): ApiResponse<PortfolioCategoryMap> {
  // Keep original dummy data as fallback
  const data: PortfolioCategoryMap = {
    'AI Learning/Exploration': [
      {
        id: 'ai-1',
        title: 'Neural Style Transfer App',
        description:
          'Advanced deep learning application that transforms artistic styles to photographs using convolutional neural networks. Features real-time processing with GPU acceleration, custom model training pipeline, and interactive web interface. Supports multiple style transfer algorithms including Gatys et al. and Johnson et al. methods. Includes batch processing capabilities, style interpolation, and comprehensive model performance analytics.',
        techStack: ['TensorFlow', 'Python', 'FastAPI', 'React', 'WebGL'],
        duration: '3-4 months',
        teamSize: 'Solo project',
        importance: 'high',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-brand-600 to-brand-700',
        hasPreview: true,
        category: 'AI Learning/Exploration',
      },
      {
        id: 'ai-2',
        title: 'LLM Fine-tuning Pipeline',
        description:
          'Automated pipeline for fine-tuning large language models on custom datasets with distributed training and model evaluation metrics.',
        techStack: ['PyTorch', 'Transformers', 'Docker', 'Kubernetes'],
        duration: '2-3 months',
        teamSize: '2 developers',
        importance: 'high',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-800 to-gray-900',
        hasPreview: true,
        category: 'AI Learning/Exploration',
      },
      {
        id: 'ai-3',
        title: 'Computer Vision Dashboard',
        description:
          'Real-time object detection and tracking system with analytics dashboard for retail environments.',
        techStack: ['OpenCV', 'YOLO', 'Flask', 'MongoDB'],
        duration: '1-2 months',
        teamSize: 'Solo project',
        importance: 'medium',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-700 to-gray-800',
        hasPreview: true,
        category: 'AI Learning/Exploration',
      },
    ],
    'Frontend/UI/UX': [
      {
        id: 'fe-1',
        title: 'Design System Library',
        description:
          'Comprehensive design system featuring 50+ accessible components built with TypeScript and extensive Storybook documentation. Includes theming system, responsive utilities, animation library, and automated testing suite. Components follow WCAG 2.1 guidelines with full keyboard navigation support. Features automated visual regression testing, comprehensive prop validation, and seamless integration with popular frameworks.',
        techStack: ['React', 'TypeScript', 'Storybook', 'Tailwind CSS'],
        duration: '2-3 months',
        teamSize: '3 designers, 2 developers',
        importance: 'high',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-brand-600 to-brand-700',
        hasPreview: true,
        category: 'Frontend/UI/UX',
      },
      {
        id: 'fe-2',
        title: 'Interactive Data Viz Platform',
        description:
          'Dynamic data visualization platform with custom chart components and real-time updates.',
        techStack: ['D3.js', 'React', 'WebSocket', 'Three.js'],
        duration: '1-2 months',
        teamSize: 'Solo project',
        importance: 'medium',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-700 to-gray-800',
        hasPreview: true,
        category: 'Frontend/UI/UX',
      },
      {
        id: 'fe-3',
        title: 'Mobile-First E-commerce',
        description:
          'Progressive web app for e-commerce with offline capabilities and seamless checkout experience.',
        techStack: ['Next.js', 'PWA', 'Stripe API', 'Tailwind'],
        duration: '3-4 weeks',
        teamSize: '2 developers',
        importance: 'medium',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-800 to-gray-900',
        hasPreview: true,
        category: 'Frontend/UI/UX',
      },
    ],
    'Full Stack': [
      {
        id: 'fs-1',
        title: 'Real-time Collaboration Platform',
        description:
          'Slack-like application with real-time messaging, file sharing, video calls, and project management features.',
        techStack: ['Node.js', 'Socket.io', 'PostgreSQL', 'Redis', 'React'],
        duration: '4-6 months',
        teamSize: '4 developers',
        importance: 'high',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-brand-600 to-brand-700',
        hasPreview: true,
        category: 'Full Stack',
      },
      {
        id: 'fs-2',
        title: 'Microservices API Gateway',
        description:
          'Scalable microservices architecture with API gateway, service discovery, and comprehensive monitoring.',
        techStack: ['Docker', 'Kubernetes', 'Node.js', 'MongoDB', 'RabbitMQ'],
        duration: '2-3 months',
        teamSize: '3 developers',
        importance: 'high',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-800 to-gray-900',
        category: 'Full Stack',
      },
    ],
    'Fun/Sandbox': [
      {
        id: 'fun-1',
        title: '3D Web Game Engine',
        description:
          'Browser-based 3D game engine with physics simulation, particle effects, and multiplayer capabilities.',
        techStack: ['Three.js', 'Cannon.js', 'WebRTC', 'WebGL'],
        duration: '2-3 months',
        teamSize: 'Solo project',
        importance: 'medium',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-700 to-gray-800',
        hasPreview: true,
        category: 'Fun/Sandbox',
      },
      {
        id: 'fun-2',
        title: 'Music Visualization Tool',
        description:
          'Interactive music visualizer with WebAudio API featuring responsive animations and custom shaders.',
        techStack: ['WebAudio API', 'WebGL', 'JavaScript', 'GLSL'],
        duration: '3-4 weeks',
        teamSize: 'Solo project',
        importance: 'low',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-700 to-gray-800',
        hasPreview: true,
        category: 'Fun/Sandbox',
      },
      {
        id: 'fun-3',
        title: 'AR Business Card',
        description:
          'Augmented reality business card using WebAR with 3D models and interactive elements.',
        techStack: ['AR.js', 'Three.js', 'WebXR', 'A-Frame'],
        duration: '1-2 weeks',
        teamSize: 'Solo project',
        importance: 'low',
        liveUrl: '#',
        repoUrl: '#',
        gradient: 'from-gray-700 to-gray-800',
        hasPreview: true,
        category: 'Fun/Sandbox',
      },
    ],
  }

  return Promise.resolve({ success: true, data: data })
}
