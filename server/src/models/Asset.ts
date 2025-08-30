// models/Asset.ts
import { Schema, model, Types } from 'mongoose';

export type AssetType =
  | 'project'
  | 'resume'
  | 'technology'
  | 'media'
  | 'avatar'
  | 'badge'
  | 'certification'
  | 'experience'
  | 'other';

export interface IAsset {
  ownerId: string; // Clerk user id (string)
  projectId?: Types.ObjectId; // present for project assets only
  path: string; // REQUIRED: GCS object key (e.g. technologies/tech-icons/...)
  contentType: string;
  size: number;
  assetType: AssetType;
  isPublic?: boolean; // for resume assets, controls public visibility
  createdAt?: Date;
  updatedAt?: Date;
  // Optional: keep a copy (if you referenced objectPath before)
  objectPath?: string;
  metadata?: Record<string, unknown>;
}

const AssetSchema = new Schema<IAsset>(
  {
    ownerId: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: false },
    path: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    assetType: {
      type: String,
      enum: ['project', 'resume', 'technology', 'media', 'avatar', 'badge', 'certification', 'experience', 'other'],
      required: true,
    },
    isPublic: { type: Boolean, default: false }, // for resume assets
    objectPath: { type: String }, // optional legacy field
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const Asset = model<IAsset>('Asset', AssetSchema);
