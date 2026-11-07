import { test, expect } from '@playwright/test'

const visiblePortrait = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const box = document.querySelector('[data-ink]')!
    const img = box.querySelector('img')!
    const canvas = box.querySelector('canvas')!
    const op = (el: Element) => Number(getComputedStyle(el).opacity)
    return { state: box.getAttribute('data-ink'), img: op(img), canvas: op(canvas) }
  })

test('reduced motion: portrait stays a plain image (no WebGL)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const p = await visiblePortrait(page)
  expect(p.state).toBe('static')
  expect(p.img).toBe(1)
})

test('motion: ink portrait enhances without errors and the portrait is always shown', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const p = await visiblePortrait(page)
  // Live (WebGL available) → canvas shown, img hidden; otherwise the reverse. Never neither.
  expect(p.img + p.canvas).toBe(1)
  // Disturb it; must not throw.
  const box = (await page.locator('[data-ink]').boundingBox())!
  for (let i = 0; i < 12; i++) await page.mouse.move(box.x + box.width * (0.1 + i * 0.07), box.y + box.height * 0.5)
  await page.waitForTimeout(300)
  expect(errors).toEqual([])
})

test('hero h1 names the category and reads as one sentence to assistive tech', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Senior frontend engineer building AI-native interfaces.' })).toBeVisible()
})
