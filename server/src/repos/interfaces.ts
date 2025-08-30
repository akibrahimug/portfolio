/**
 * Repository interfaces to abstract persistence.
 */
import type { Types } from 'mongoose';

export interface ProjectDTO {
  _id?: Types.ObjectId | string;
  slug: string;
  title: string;
  // category replaces legacy kind/projectType
  category?: string;
  kind?: string;
  description?: string;
  techStack: string[];
  tags?: string[];
  technologyIds?: Array<Types.ObjectId | string>;
  heroImageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  repoUrl?: string | null;
  gradient?: string | null;
  hasPreview?: boolean;
  duration?: string | null;
  teamSize?: string | null;
  status?: 'draft' | 'published' | 'archived';
  importance?: 'high' | 'medium' | 'low';
  visibility: 'public' | 'private';
  ownerId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  views?: number;
  likes?: number;
}

export interface ProjectsRepo {
  ensureIndexes(): Promise<void>;
  list(params: {
    filter?: Partial<ProjectDTO> & { search?: string };
    limit: number;
    cursor?: string;
  }): Promise<{ items: ProjectDTO[]; nextCursor?: string }>;
  getById(id: string): Promise<ProjectDTO | null>;
  getBySlug(slug: string): Promise<ProjectDTO | null>;
  create(data: Omit<ProjectDTO, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDTO>;
  updateById(id: string, data: Partial<ProjectDTO>): Promise<ProjectDTO | null>;
  deleteById(id: string): Promise<void>;
}

export interface AssetDTO {
  _id?: Types.ObjectId | string;
  projectId: Types.ObjectId | string;
  ownerId: string;
  path: string;
  contentType: string;
  size: number;
  createdAt?: Date | string;
}

export interface AssetsRepo {
  ensureIndexes(): Promise<void>;
  create(data: Omit<AssetDTO, '_id' | 'createdAt'>): Promise<AssetDTO>;
}

export interface TechnologyDTO {
  _id?: Types.ObjectId | string;
  name: string;
  category: string;
  description: string;
  complexity: string;
  icon: string;
  color: string;
  experience: string;
  yearsOfExperience?: number;
  learningSource: string;
  confidenceLevel: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TechnologiesRepo {
  ensureIndexes(): Promise<void>;
  list(): Promise<TechnologyDTO[]>;
  getById(id: string): Promise<TechnologyDTO | null>;
  create(data: Omit<TechnologyDTO, '_id' | 'createdAt'>): Promise<TechnologyDTO>;
  updateById(id: string, data: Partial<TechnologyDTO>): Promise<TechnologyDTO | null>;
  deleteById(id: string): Promise<void>;
}

export interface UsersRepo {
  // Placeholder for future expansion if we mirror users locally
}
