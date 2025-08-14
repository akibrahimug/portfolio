.PHONY: db-up db-down db-logs db-ps dev build start

db-up:
docker compose up -d mongo

db-down:
docker compose down

db-logs:
docker compose logs -f mongo

db-ps:
docker compose ps

dev:
npm run dev

build:
npm run build

start:
npm start
