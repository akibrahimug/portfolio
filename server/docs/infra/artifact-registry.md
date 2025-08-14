# Artifact Registry Setup

Create a regional Docker repository for images.

```bash
PROJECT_ID=<your-project-id>
REGION=<your-region> # e.g., us-central1
REPO=backend

gcloud services enable artifactregistry.googleapis.com --project $PROJECT_ID

gcloud artifacts repositories create $REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Backend images" \
  --project $PROJECT_ID

# Configure Docker auth
gcloud auth configure-docker $REGION-docker.pkg.dev
```

Build and push:
```bash
REGISTRY=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO
IMAGE=$REGISTRY/portfolio-backend:local

docker build -t $IMAGE .
docker push $IMAGE
```
