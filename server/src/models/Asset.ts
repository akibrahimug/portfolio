/**
 * Asset model (Mongoose)
 * - References Project via `projectId`
 * - Stored object path in GCS under a namespaced prefix
 */
import { Schema, model, type Document, Types } from 'mongoose';

const assetSchema = new Schema(
  {
    projectId: { type: Types.ObjectId, ref: 'Project', index: true, required: true },
    ownerId: { type: String, required: true },
    path: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export interface AssetDocument extends Document {
  projectId: Types.ObjectId;
  ownerId: string;
  path: string;
  contentType: string;
  size: number;
  createdAt: Date;
}

export const Asset = model<AssetDocument>('Asset', assetSchema);
