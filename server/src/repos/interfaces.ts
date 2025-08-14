/**
 * Repository interfaces to abstract persistence.
 */
import type { Types } from 'mongoose';

export interface ProjectDTO {
  _id?: Types.ObjectId | string;
  title: string;
  slug: string;
  kind: 'learning' | 'frontend' | 'fullstack' | 'ai_learning';
  description?: string;
  techStack: string[];
  tags: string[];
  heroImageUrl?: string | null;
  visibility: 'public' | 'private';
  status: 'draft' | 'published' | 'archived';
  ownerId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  views?: number;
  likes?: number;
}

export interface ProjectsRepo {
  ensureIndexes(): Promise<void>;
  list(params: { filter?: Partial<ProjectDTO> & { search?: string; tags?: string[] }; limit: number; cursor?: string }): Promise<{ items: ProjectDTO[]; nextCursor?: string }>;
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

export interface UsersRepo {
  // Placeholder for future expansion if we mirror users locally
}
