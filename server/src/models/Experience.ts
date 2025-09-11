/**
 * Experience model (Mongoose)
 * - Professional work experience and career history
 */
import { Schema, model, type Document } from 'mongoose';

const experienceSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Apprenticeship', 'Seasonal'],
      default: 'Full-time'
    },
    location: { type: String, default: '' },
    locationType: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site'
    },
    description: { type: String, default: '' },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
    current: { type: Boolean, default: false },
    skills: { type: [String], default: [] },
    companyLogoUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    ownerId: { type: String, required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  },
  { timestamps: true },
);

export interface ExperienceDocument extends Document {
  title: string;
  company: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | 'Apprenticeship' | 'Seasonal';
  location: string;
  locationType: 'On-site' | 'Remote' | 'Hybrid';
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  skills: string[];
  companyLogoUrl: string;
  linkedinUrl: string;
  ownerId: string;
  visibility: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
}

export const Experience = model<ExperienceDocument>('Experience', experienceSchema);