/**
 * Project model (Mongoose)
 * - Denormalized `views` and `likes` for fast reads (optional)
 */
import { Schema, model, type Document } from 'mongoose';

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    // Use `category` instead of legacy `kind`/`projectType`
    description: { type: String },
    techStack: { type: [String], default: [] },
    technologyIds: { type: [Schema.Types.ObjectId], ref: 'Technology', default: [] },
    // Legacy compatibility: keep `kind` alongside `category`
    kind: { type: String, default: '' },
    // Optional labels/tags
    tags: { type: [String], default: [] },
    // Optional lifecycle status
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    heroImageUrl: { type: String, default: null },
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    // Optional repository URL alias for UI (kept alongside githubUrl for compatibility)
    repoUrl: { type: String, default: '' },
    // Optional visual styling
    gradient: { type: String, default: '' },
    // Optional preview metadata
    hasPreview: { type: Boolean, default: false },
    previewType: { 
      type: String, 
      enum: ['image', 'components', 'visualization', 'platform', 'game', 'music', 'ar', 'chart', 'dashboard', 'ecommerce', 'other'], 
      default: 'platform' 
    },
    // Optional display/category metadata
    category: { type: String, default: '' },
    // Optional timeline/team metadata
    duration: { type: String, default: '' },
    teamSize: { type: String, default: '' },
    importance: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    ownerId: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export interface ProjectDocument extends Document {
  slug: string;
  title: string;
  description?: string;
  techStack: string[];
  technologyIds: Array<string>;
  kind?: string | null;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  heroImageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  repoUrl?: string | null;
  gradient?: string | null;
  hasPreview?: boolean;
  previewType?: 'image' | 'components' | 'visualization' | 'platform' | 'game' | 'music' | 'ar' | 'chart' | 'dashboard' | 'ecommerce' | 'other';
  category?: string | null;
  duration?: string | null;
  teamSize?: string | null;
  importance?: 'high' | 'medium' | 'low';
  visibility: 'public' | 'private';
  ownerId: string;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Project = model<ProjectDocument>('Project', projectSchema);
