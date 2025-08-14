"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
/**
 * Project model (Mongoose)
 * - Unique `slug` for public lookups
 * - Denormalized `views` and `likes` for fast reads (optional)
 */
const mongoose_1 = require("mongoose");
const projectSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.Project = (0, mongoose_1.model)('Project', projectSchema);
//# sourceMappingURL=Project.js.map