/**
 * Centralized configuration with Zod validation and sensible defaults.
 *
 * Responsibilities:
 * - Parse `process.env` once and expose a typed `config` object
 * - Derive arrays from CSV envs (e.g., WS_ORIGINS)
 * - Derive Mongo URI (supports MONGODB_URI, DATABASE_URL, defaults to local in dev)
 * - Derive Clerk JWKS URL from CLERK_ISSUER when not provided
 */
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : NaN))
    .refine((v) => Number.isFinite(v) || Number.isNaN(v), 'PORT must be a number')
    .optional(),
  API_BASE: z.string().default('/api/v1'),
  SERVICE_NAME: z.string().default('portfolio-backend'),
  WS_ORIGINS: z.string().optional(), // comma-separated
  MONGODB_URI: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  // Clerk via JWKS (frontend issues tokens)
  CLERK_ISSUER: z.string().optional(),
  CLERK_JWKS_URL: z.string().optional(),
  CLERK_AUDIENCE: z.string().optional(),
  // GCP/GCS
  GCP_PROJECT_ID: z.string().optional(),
  GCP_REGION: z.string().optional(),
  GCP_ARTIFACT_REGISTRY_REPO: z.string().optional(),
  GCS_BUCKET_UPLOADS: z.string().optional(),
  // Optional
  SENTRY_DSN: z.string().optional(),
  ALLOWED_UPLOAD_MIME: z.string().optional(), // comma-separated
  MAX_UPLOAD_MB: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : NaN))
    .optional(),
  // OpenTelemetry (optional)
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  // Rate limiting
  RATE_LIMIT_RPM: z
    .string()
    .transform((v) => (v ? parseInt(v, 10) : NaN))
    .optional(),
});

const raw = EnvSchema.parse(process.env);

function parseCsv(value?: string): string[] | undefined {
  if (!value) return undefined;
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
function resolveMongoUri(): string {
  let value = (raw.MONGODB_URI || raw.DATABASE_URL || '').trim();
  if (!value && raw.NODE_ENV !== 'production') {
    return 'mongodb://localhost:27017/portfolio';
  }
  if (value.startsWith('DATABASE_URL=')) value = value.substring('DATABASE_URL='.length).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

const mongodbUri = resolveMongoUri();

const allowedUploadMime = parseCsv(raw.ALLOWED_UPLOAD_MIME) ?? [
  'image/png',
  'image/jpeg',
  'image/webp',
];

const clerkIssuer = raw.CLERK_ISSUER;
// If JWKS URL not explicitly provided, derive it from issuer
const clerkJwksUrl =
  raw.CLERK_JWKS_URL ||
  (clerkIssuer ? `${clerkIssuer.replace(/\/$/, '')}/.well-known/jwks.json` : undefined);

const config = {
  nodeEnv: raw.NODE_ENV,
  port: Number.isNaN(raw.PORT as unknown as number) ? 5000 : (raw.PORT as unknown as number),
  apiBase: raw.API_BASE || '/api/v1',
  serviceName: raw.SERVICE_NAME || 'portfolio-backend',
  wsOrigins,
  mongodbUri,
  clerk: {
    issuer: clerkIssuer,
    jwksUrl: clerkJwksUrl,
    audience: raw.CLERK_AUDIENCE,
  },
  gcp: {
    projectId: raw.GCP_PROJECT_ID,
    region: raw.GCP_REGION,
    artifactRegistryRepo: raw.GCP_ARTIFACT_REGISTRY_REPO,
  },
  gcs: {
    bucketUploads: raw.GCS_BUCKET_UPLOADS,
  },
  sentryDsn: raw.SENTRY_DSN,
  uploads: {
    allowedMime: allowedUploadMime,
    maxMb: Number.isNaN(raw.MAX_UPLOAD_MB as unknown as number)
      ? 20
      : (raw.MAX_UPLOAD_MB as unknown as number),
  },
  otel: {
    endpoint: raw.OTEL_EXPORTER_OTLP_ENDPOINT,
  },
  rateLimit: {
    rpm: Number.isNaN(raw.RATE_LIMIT_RPM as unknown as number)
      ? 120
      : (raw.RATE_LIMIT_RPM as unknown as number),
  },
};

export type AppConfig = typeof config;
export default config;
