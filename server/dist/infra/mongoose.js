"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoose = connectMongoose;
/**
 * Mongoose connection bootstrap.
 * Validates the URI shape and applies conservative pool/timeout settings
 * suitable for serverless/containerized environments.
 */
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
/**
 * Connect to MongoDB using Mongoose.
 * @param uri Optional URI; falls back to config.mongodbUri
 */
async function connectMongoose(uri) {
    const resolvedUri = (uri && uri.trim()) || config_1.default.mongodbUri;
    if (!resolvedUri)
        throw new Error('MONGODB_URI is required');
    if (!resolvedUri.startsWith('mongodb://') && !resolvedUri.startsWith('mongodb+srv://')) {
        throw new Error(`Invalid MONGODB_URI. Expected it to start with "mongodb://" or "mongodb+srv://". Got: ${resolvedUri}`);
    }
    await mongoose_1.default.connect(resolvedUri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 5000,
    });
    return mongoose_1.default;
}
//# sourceMappingURL=mongoose.js.map