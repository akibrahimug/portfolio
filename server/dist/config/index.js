"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Centralized configuration with Zod validation and sensible defaults.
 *
 * Responsibilities:
 * - Parse `process.env` once and expose a typed `config` object
 * - Derive arrays from CSV envs (e.g., WS_ORIGINS)
 * - Derive Mongo URI (supports MONGODB_URI, DATABASE_URL, defaults to local in dev)
 * - Derive Clerk JWKS URL from CLERK_ISSUER when not provided
 */
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z
        .string()
        .transform((v) => (v ? parseInt(v, 10) : NaN))
        .refine((v) => Number.isFinite(v) || Number.isNaN(v), 'PORT must be a number')
        .optional(),
    API_BASE: zod_1.z.string().default('/api/v1'),
    SERVICE_NAME: zod_1.z.string().default('portfolio-backend'),
    WS_ORIGINS: zod_1.z.string().optional(), // comma-separated
    MONGODB_URI: zod_1.z.string().optional(),
    DATABASE_URL: zod_1.z.string().optional(),
    // Clerk via JWKS (frontend issues tokens)
    CLERK_ISSUER: zod_1.z.string().optional(),
    CLERK_JWKS_URL: zod_1.z.string().optional(),
    CLERK_AUDIENCE: zod_1.z.string().optional(),
    // GCP/GCS
    GCP_PROJECT_ID: zod_1.z.string().optional(),
    GCP_REGION: zod_1.z.string().optional(),
    GCP_ARTIFACT_REGISTRY_REPO: zod_1.z.string().optional(),
    GCS_BUCKET_UPLOADS: zod_1.z.string().optional(),
    // Optional
    SENTRY_DSN: zod_1.z.string().optional(),
    ALLOWED_UPLOAD_MIME: zod_1.z.string().optional(), // comma-separated
    MAX_UPLOAD_MB: zod_1.z
        .string()
        .transform((v) => (v ? parseInt(v, 10) : NaN))
        .optional(),
    // OpenTelemetry (optional)
    OTEL_EXPORTER_OTLP_ENDPOINT: zod_1.z.string().optional(),
});
const raw = EnvSchema.parse(process.env);
function parseCsv(value) {
    if (!value)
        return undefined;
    return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}
const wsOrigins = parseCsv(raw.WS_ORIGINS) ?? ['*'];
/**
 * Resolve the Mongo connection string with fallbacks:
 * - Use MONGODB_URI or DATABASE_URL when provided
 * - Strip accidental `DATABASE_URL=` prefixes and surrounding quotes
 * - Default to local standalone mongo in non-production
 */
function resolveMongoUri() {
    let value = (raw.MONGODB_URI || raw.DATABASE_URL || '').trim();
    if (!value && raw.NODE_ENV !== 'production') {
        return 'mongodb://localhost:27017/portfolio';
    }
    if (value.startsWith('DATABASE_URL='))
        value = value.substring('DATABASE_URL='.length).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }
    return value;
}
// Get the resolved MongoDB connection string
const mongodbUri = resolveMongoUri();
// Default allowed MIME types for file uploads if not configured
const allowedUploadMime = parseCsv(raw.ALLOWED_UPLOAD_MIME) ?? [
    'image/png',
    'image/jpeg',
    'image/webp',
];
// Extract Clerk authentication settings
const clerkIssuer = raw.CLERK_ISSUER;
// If JWKS URL not explicitly provided, derive it from issuer
const clerkJwksUrl = raw.CLERK_JWKS_URL ||
    (clerkIssuer ? `${clerkIssuer.replace(/\/$/, '')}/.well-known/jwks.json` : undefined);
/**
 * Main application configuration object.
 * Combines environment variables with defaults and derived values.
 */
const config = {
    nodeEnv: raw.NODE_ENV,
    port: Number.isNaN(raw.PORT) ? 5000 : raw.PORT,
    apiBase: raw.API_BASE || '/api/v1',
    serviceName: raw.SERVICE_NAME || 'portfolio-backend',
    wsOrigins,
    mongodbUri,
    // Clerk authentication configuration
    clerk: {
        issuer: clerkIssuer,
        jwksUrl: clerkJwksUrl,
        audience: raw.CLERK_AUDIENCE,
    },
    // Google Cloud Platform settings
    gcp: {
        projectId: raw.GCP_PROJECT_ID,
        region: raw.GCP_REGION,
        artifactRegistryRepo: raw.GCP_ARTIFACT_REGISTRY_REPO,
    },
    // Google Cloud Storage settings
    gcs: {
        bucketUploads: raw.GCS_BUCKET_UPLOADS,
    },
    // Error tracking
    sentryDsn: raw.SENTRY_DSN,
    // File upload settings
    uploads: {
        allowedMime: allowedUploadMime,
        maxMb: Number.isNaN(raw.MAX_UPLOAD_MB) ? 20 : raw.MAX_UPLOAD_MB,
    },
    // OpenTelemetry configuration
    otel: {
        endpoint: raw.OTEL_EXPORTER_OTLP_ENDPOINT,
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map