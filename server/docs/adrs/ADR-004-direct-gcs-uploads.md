# ADR-004: Direct GCS Uploads

Use V4 signed URLs for browser-to-GCS direct uploads. Benefits: minimizes server bandwidth, improves UX, and reduces timeouts. The server issues signed PUT URLs and records assets on confirmation.
