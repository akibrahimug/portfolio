/**
 * Technology model (Mongoose)
 */
import { Schema, model, type Document } from 'mongoose';

const technologySchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    complexity: { type: String, required: false, default: 'Beginner' },
    icon: { type: String, required: false, default: '' },
    color: { type: String, required: false, default: '' },
    // Legacy field (string). Kept for backward compatibility.
    experience: { type: String, required: false, default: '' },
    // Preferred numeric field used by the client forms
    yearsOfExperience: { type: Number, required: false, default: 0 },
    learningSource: { type: String, required: false, default: '' },
    confidenceLevel: { type: Number, required: false, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export interface TechnologyDocument extends Document {
  name: string;
  category: string;
  description: string;
  complexity: string;
  icon: string;
  color: string;
  experience: string;
  learningSource: string;
  confidenceLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Technology = model<TechnologyDocument>('Technology', technologySchema);
