import { test, expect } from '@playwright/test'

test('the portrait is a still photograph: no canvas, no effect, no errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/', { waitUntil: 'networkidle' })
  const portrait = page.locator('#top img')
  await expect(portrait).toBeVisible()
  expect(await portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
  await expect(page.locator('#top canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('hero h1 names the category and reads as one sentence to assistive tech', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Senior frontend engineer building AI-native interfaces.' })).toBeVisible()
})
