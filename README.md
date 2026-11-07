# Portfolio — kasomaibrahim.dev

Personal portfolio for **Ibrahim Kasoma**, Senior Software Engineer (TypeScript · React · Node.js).

Single Next.js app (App Router), statically prerendered, deployed on Vercel. The only server-side surface is `app/api/contact/route.ts`, a Resend-backed mailer.

## Local dev

```bash
yarn install
yarn dev          # http://localhost:3000
yarn typecheck && yarn test
```

Copy `.env.example` to `.env.local` and fill in the Resend keys.

## Deploy

Push to `master`; Vercel deploys automatically.

## License

MIT — Ibrahim Kasoma
