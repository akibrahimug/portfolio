# Secret Manager Setup

Store runtime secrets for Cloud Run to consume.

## Create Secrets
```bash
PROJECT_ID=<your-project-id>

# MongoDB connection string
echo -n 'mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority' | gcloud secrets create MONGODB_URI --data-file=- --replication-policy=automatic --project $PROJECT_ID

# Clerk
echo -n 'https://<your-clerk-issuer>' | gcloud secrets create CLERK_ISSUER --data-file=- --replication-policy=automatic --project $PROJECT_ID || true
```

Note: We pass `CLERK_ISSUER` as a plain env var in deploy, but you may store it as a secret and use `--set-secrets` instead.

## Grant Access to Cloud Run Service Account
```bash
SA_EMAIL=<cloud-run-service-account>@$PROJECT_ID.iam.gserviceaccount.com

gcloud secrets add-iam-policy-binding MONGODB_URI \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/secretmanager.secretAccessor \
  --project $PROJECT_ID
```

## Use in Deploy
```bash
gcloud run deploy $SERVICE_NAME-stg \
  --set-secrets=MONGODB_URI=MONGODB_URI:latest \
  # ...
```
