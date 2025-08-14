/**
 * Project model (Mongoose)
 * - Unique `slug` for public lookups
 * - Denormalized `views` and `likes` for fast reads (optional)
 */
import { Schema, model, type Document } from 'mongoose';

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true, required: true },
    kind: {
      type: String,
      enum: ['learning', 'frontend', 'fullstack', 'ai_learning'],
      required: true,
    },
    description: { type: String },
    techStack: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    heroImageUrl: { type: String, default: null },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    ownerId: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export interface ProjectDocument extends Document {
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
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Project = model<ProjectDocument>('Project', projectSchema);
