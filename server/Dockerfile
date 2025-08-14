# Builder: install deps and compile TS
FROM node:20 as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner: lean image for production
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production \\
    NODE_OPTIONS=--enable-source-maps
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# Drop root for security
RUN useradd -m -u 10001 appuser \
  && chown -R appuser:appuser /app
USER appuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/v1/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"
CMD ["node", "dist/index.js"]