/**
 * One-off asset generator for SEO work:
 *  - square favicons 48/192/512 (transparent) from public/favicon.png
 *  - apple-touch-icon 180 (solid paper background)
 *  - favicon.ico (PNG-in-ICO, 48px)
 *  - og.png 1200x630 editorial card (Syne + Hanken, paper/ink/red palette)
 *
 * Run:  node scripts/generate-seo-assets.mjs   (from client/)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('@playwright/test')

const PUB = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public')
const b64 = (p) => fs.readFileSync(p).toString('base64')
const faviconData = `data:image/png;base64,${b64(path.join(PUB, 'favicon.png'))}`
const avatarData = `data:image/png;base64,${b64(path.join(PUB, 'icons/avarta-cutout.png'))}`

const PAPER = '#fbf9f4'
const INK = '#2e2a25'
const MUTED = '#6f675c'
const RED = '#d10413'

const browser = await chromium.launch()
const page = await browser.newPage()

async function renderIcon(size, out, { bg = null, pad = 0 } = {}) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${bg ?? 'transparent'}">
    <img src="${faviconData}" style="width:${size - pad * 2}px;height:${size - pad * 2}px;object-fit:contain" />
  </body></html>`)
  await page.screenshot({ path: out, omitBackground: !bg })
  console.log('wrote', out)
}

await renderIcon(48, path.join(PUB, 'icons/favicon-48.png'))
await renderIcon(192, path.join(PUB, 'icons/favicon-192.png'))
await renderIcon(512, path.join(PUB, 'icons/favicon-512.png'))
await renderIcon(180, path.join(PUB, 'icons/apple-touch-icon.png'), { bg: PAPER, pad: 16 })

// favicon.ico: modern PNG-in-ICO container around the 48px PNG
{
  const png = fs.readFileSync(path.join(PUB, 'icons/favicon-48.png'))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // count
  const entry = Buffer.alloc(16)
  entry.writeUInt8(48, 0) // width
  entry.writeUInt8(48, 1) // height
  entry.writeUInt8(0, 2) // palette
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // planes
  entry.writeUInt16LE(32, 6) // bpp
  entry.writeUInt32LE(png.length, 8) // data size
  entry.writeUInt32LE(22, 12) // data offset
  fs.writeFileSync(path.join(PUB, 'favicon.ico'), Buffer.concat([header, entry, png]))
  console.log('wrote', path.join(PUB, 'favicon.ico'))
}

// OG card — editorial: paper, Syne display name, red eyebrow, portrait right
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(
  `<!doctype html><html><head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; background: ${PAPER}; color: ${INK};
           font-family: 'Hanken Grotesk', sans-serif; overflow: hidden; position: relative; }
    .frame { position: absolute; inset: 28px; border: 1px solid rgba(46,42,37,.18); }
    .col { position: absolute; left: 84px; top: 112px; max-width: 600px; }
    .eyebrow { font-size: 21px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: ${RED}; }
    .name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 90px; line-height: 1.04;
            letter-spacing: -0.02em; margin-top: 28px; }
    .sub { margin-top: 32px; font-size: 27px; color: ${INK}; font-weight: 600; }
    .sub2 { margin-top: 12px; font-size: 24px; color: ${MUTED}; font-weight: 500; }
    .domain { position: absolute; left: 84px; bottom: 74px; font-size: 24px; font-weight: 600;
              letter-spacing: .04em; display: flex; align-items: center; gap: 16px; }
    .domain img { width: 40px; height: 40px; }
    .portrait { position: absolute; right: 30px; bottom: 29px; height: 520px; }
  </style></head><body>
    <div class="frame"></div>
    <div class="col">
      <div class="eyebrow">Senior Software Engineer</div>
      <div class="name">Ibrahim<br>Kasoma.</div>
      <div class="sub">TypeScript · React · Node.js</div>
      <div class="sub2">80+ apps shipped · 3.4M+ users · 60+ markets</div>
    </div>
    <div class="domain"><img src="${faviconData}" alt="">www.kasomaibrahim.dev</div>
    <img class="portrait" src="${avatarData}" alt="">
  </body></html>`,
  { waitUntil: 'networkidle' },
)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: path.join(PUB, 'og.png') })
console.log('wrote', path.join(PUB, 'og.png'))

await browser.close()
