# Cloud Run Setup

This service runs on Cloud Run (fully managed). This guide covers manual setup; GitHub Actions automates deploys thereafter.

## Prereqs
- gcloud CLI authenticated to your GCP project
- Billing enabled
- APIs enabled:
  - Cloud Run Admin API
  - Cloud Build API (optional if building in GHA only)
  - Artifact Registry API
  - Secret Manager API

```bash
PROJECT_ID=<your-project-id>
REGION=<your-region> # e.g., us-central1
SERVICE_NAME=portfolio-backend

gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com --project $PROJECT_ID
```

## First-time Deploy (from local)
Build and push the image to Artifact Registry, then deploy Cloud Run.

```bash
REPO=backend
REGISTRY=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO
IMAGE=$REGISTRY/$SERVICE_NAME:manual

# Create AR repo if missing
gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION --description="Backend repo" --project $PROJECT_ID || true

# Auth and push
gcloud auth configure-docker $REGION-docker.pkg.dev
docker build -t $IMAGE .
docker push $IMAGE

# Secrets must be created beforehand (see Secret Manager doc)

# Deploy Cloud Run
gcloud run deploy $SERVICE_NAME-stg \
  --image=$IMAGE \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=5000 \
  --set-env-vars=NODE_ENV=production \
  --set-env-vars=API_BASE=/api/v1 \
  --set-env-vars=WS_ORIGINS="https://your-frontend" \
  --set-env-vars=CLERK_ISSUER="https://<your-clerk-issuer>" \
  --set-env-vars=CLERK_AUDIENCE=portfolio-backend \
  --set-env-vars=GCS_BUCKET_UPLOADS=<your-bucket> \
  --set-secrets=MONGODB_URI=MONGODB_URI:latest \
  --min-instances=0 --max-instances=10 --concurrency=80 --timeout=900s
```

Verify readiness:
```bash
curl -f https://<cloud-run-url>/api/v1/readyz
```

## Production Promotion
Use the GitHub Actions workflow (manual promotion job) or deploy another service `$SERVICE_NAME-prd` and switch traffic once ready.

## Cost Controls
- Min instances 0–1
- Concurrency ~80
- Keep CPU idle off (default) unless needed
