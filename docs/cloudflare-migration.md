# Cloudflare migration — improvement plan

Status: **proposed, not started.** Author: 2026-05-01.

## TL;DR

- **Cheaper:** marginal. .dev renewal at Cloudflare is at-cost (~$11–12/yr) vs Namecheap's ~$13–15/yr. Saves ~$3/yr per domain. Not the reason to switch.
- **Modern tooling:** yes — meaningfully. Free email forwarding, free DNS API, optional free CDN/WAF, optional free Pages/Workers/R2 if Vercel ever becomes a constraint.
- **Restricted features:** Cloudflare Registrar charges at-cost — they don't sell upsells. WHOIS privacy is free and on by default. No "premium DNS" upsell.
- **Recommended path:** two phases — (1) move DNS + email routing now (low risk, no money on the table), (2) transfer registration on next renewal cycle (saves the markup, picks up an extra year).

## Current state

`kasomaibrahim.dev` is registered at Namecheap, paid through **Mar 18, 2027** (5-year reg from 2022). Currently using:

- **Nameservers:** Namecheap BasicDNS
- **Email:** none (Resend handles the *outbound* contact form via `hello@kasomaibrahim.dev`. No inbound mailbox exists — the Resend "from" address is a sender identity, not a real inbox).
- **WHOIS privacy:** WithheldforPrivacy (Namecheap's free tier).
- **Paid upsells declined:** PremiumDNS, Private Email, Email Forwarding.

Vercel hosts the deployed site. Namecheap → Vercel via DNS records (A/CNAME). Vercel manages SSL via Let's Encrypt.

## What Cloudflare offers (free unless noted)

| Service | Cloudflare | Namecheap equivalent |
|---|---|---|
| Authoritative DNS | Free, anycast, fast TTL propagation | Free (BasicDNS) — slower, no API |
| DNS API | Free, well-documented, scriptable | None on BasicDNS; PremiumDNS is paid |
| Email forwarding | Free, unlimited aliases, catch-all | Paid ($10/yr) |
| Inbound mailbox | Not offered (forwarding only) | Private Email — paid |
| CDN / WAF / DDoS | Free tier covers small sites comfortably | Not offered at registrar level |
| TLS for proxied traffic | Free, auto-managed | N/A |
| Registrar | At-cost (~$11–12/yr for .dev) | Markup pricing |
| WHOIS privacy | Free, on by default | Free (WithheldforPrivacy) |
| Workers (edge compute) | 100k req/day free | Not offered |
| Pages (static hosting) | Free generous tier | Not offered |
| R2 (S3-compatible) | 10 GB free | Not offered |

## Cost comparison

For this domain specifically:

- **Namecheap:** next renewal at ~$13–15/yr in Mar 2027. Add $10/yr if email forwarding is ever needed. PremiumDNS is $5/yr if DNS API or higher availability matters.
- **Cloudflare:** ~$11–12/yr renewal. Email forwarding free. DNS API free. No upsells.

Across a 5-year horizon: ~$15–25 saved on the registrar line, plus avoided email-forwarding fees if that ever becomes wanted.

## Migration plan

### Phase 1 — DNS + email routing (now, low risk)

Keep registration at Namecheap; move only nameservers. Reversible in <1hr.

1. Sign up at https://cloudflare.com (free).
2. Add `kasomaibrahim.dev` as a site. Pick the Free plan.
3. Cloudflare scans current Namecheap DNS records and imports them. **Verify the imported list matches the live Vercel A/CNAME records before continuing.**
4. Cloudflare gives you 2 nameservers (e.g., `clyde.ns.cloudflare.com`, `meera.ns.cloudflare.com`). Names vary per account.
5. In Namecheap → Domain List → kasomaibrahim.dev → Domain tab → Nameservers → switch from "Namecheap BasicDNS" to "Custom DNS" and paste Cloudflare's 2 nameservers.
6. Wait for propagation (typically 15min–4hr). Cloudflare will email when active.
7. In Cloudflare dashboard → Email → Email Routing → enable.
8. Verify destination address (`kasomaibrahim@gmail.com`).
9. Add route: `hello@kasomaibrahim.dev` → `kasomaibrahim@gmail.com`. (Optional: also catch-all → same destination, so any address-typo or `contact@` etc. still reaches you.)
10. Cloudflare auto-adds the necessary MX + SPF records.
11. Test: send a mail to `hello@kasomaibrahim.dev` from any other inbox — should land in gmail within seconds.

**Vercel compatibility:** the existing A/CNAME records pointing at Vercel keep working. Leave them as **DNS-only (grey cloud)** — do *not* enable Cloudflare's orange-cloud proxy on the Vercel hostname unless you also configure Full (Strict) SSL and Vercel's reverse-proxy compatibility settings. The grey-cloud setup is the zero-risk option and gives you free DNS + email routing without touching the Vercel deploy.

**Resend compatibility:** the verified domain in Resend uses DNS records (DKIM + SPF). After the nameserver switch, those records need to exist in Cloudflare DNS too. The import in step 3 should pick them up — verify by checking Resend's domain status page after Cloudflare goes live. If Resend reports the domain unverified, re-add the DKIM CNAME and the SPF TXT record from Resend's dashboard.

### Phase 2 — Transfer registration (closer to renewal, optional)

Worth doing ~60 days before the Mar 2027 renewal, OR sooner if you want to lock in lower pricing immediately. ICANN requires the domain to be >60 days old since last transfer (it is — last activity was 2022).

1. In Namecheap → Domain List → kasomaibrahim.dev → Sharing & Transfer → unlock the domain and request the auth code (sent by email).
2. In Cloudflare → Domain Registration → Transfer Domains → enter `kasomaibrahim.dev` and the auth code.
3. Pay the transfer fee (~$11–12 — it covers one full year of renewal, *added to* the existing expiry, so the new expiry becomes Mar 2028).
4. Approve the transfer email from Namecheap. Transfer completes in ~5–7 days.

After this, Cloudflare is both registrar and DNS host. Single dashboard. Renewals at-cost forever.

## Risks and gotchas

- **HSTS-preload TLD:** `.dev` is on the HSTS preload list — every connection must be HTTPS. If Cloudflare's proxy is ever turned on (orange cloud), it must be set to "Full (Strict)" SSL mode. Leaving it on "Flexible" or "Full" (without strict) breaks the site silently for some clients. Easiest avoidance: keep grey-cloud on Vercel hostnames.
- **DNS record drift:** if you ever edit DNS at Namecheap after the nameserver switch, those edits go nowhere. The first failed deploy or expired SSL after a "fix" applied at the wrong dashboard is the canonical way people learn this. Bookmark Cloudflare's DNS page after migration and don't go back to Namecheap for DNS.
- **Cloudflare account 2FA:** turn this on. Account compromise = domain hijack. Use a hardware key or TOTP, not SMS.
- **Email Routing is forwarding only:** no SMTP send, no IMAP, no real mailbox. If you ever want a *sent-from* `hello@kasomaibrahim.dev` mailbox (vs Resend's API-only sender identity), you'll need a real provider — Fastmail (~$3/mo), Migadu (~$20/yr), Google Workspace (~$6/mo), Proton, etc. Cloudflare doesn't compete here.
- **WHOIS data still public for the registrant:** privacy hides personal details, but the registrar contact is visible. Same as Namecheap.
- **Transfer locks:** post-transfer, ICANN requires a 60-day lock before the domain can be transferred again. Plan around this if you ever want to move providers a second time.

## What does *not* change

- Vercel deploy, build pipeline, environment variables.
- Resend integration — DNS records carry over.
- The site URL, SSL behaviour for end users.
- The CNAME/A records for any subdomains currently in use.
- Anything in this repo. Migration is entirely outside the codebase.

## When to do this

Phase 1 (DNS + email) is safe to do any time and reversible. Suggested trigger: the next time you want a `hello@`-style inbound address, or the next time you want DNS-as-code via Terraform / a script. Until either of those bites, the existing Namecheap setup is fine.

Phase 2 (registrar transfer) is best done in the 60-day window before Mar 18, 2027. Sooner if you want the savings immediately. No urgency — registration is good through 2027 today.

## Decision

This doc is a checkpoint, not a commitment. Migrate when one of the following is true:

1. Inbound email at the domain becomes wanted (Phase 1 unblocks it for free).
2. DNS changes need to happen via API or a script (Phase 1 enables it).
3. Renewal date approaches and the markup feels avoidable (Phase 2).
4. Vercel limits get hit and Pages/Workers becomes a real alternative to evaluate (no migration required for that — Cloudflare Pages can deploy from this repo independently).
