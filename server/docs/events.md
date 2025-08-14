# Event Catalog (v1)

All messages use JSON: { event, payload }.

- auth:hello
  - req: { version: "v1", token }
  - res: { user: { id, email, name }, issuedAt }
- system:ping
  - req: { version: "v1", ts }
  - res: { pong: true, ts, latencyMs }
- projects:list
  - req: { version: "v1", filter?, limit?, cursor? }
  - res: { items: Project[], nextCursor? }
- projects:get
  - req: { version: "v1", id? | slug? }
  - res: { project: Project | null }
- assets:requestUpload
  - req: { version: "v1", projectId, filename, contentType, size }
  - res: { uploadUrl, objectPath, headers, expiresAt }
- assets:confirm
  - req: { version: "v1", projectId, objectPath, contentType, size }
  - res: { asset }
- stats:get
  - req: { version: "v1" }
  - res: { connections, epm, errorRate, p95ms }
- stats:subscribe
  - req: { version: "v1", intervalMs? }
  - push: same as stats:get

