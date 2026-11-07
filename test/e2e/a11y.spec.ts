import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
}

test('no serious/critical a11y violations — light', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('theme', 'light'))
  await page.reload({ waitUntil: 'networkidle' })
  const violations = await scan(page)
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
})

test('no serious/critical a11y violations — dark', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('theme', 'dark'))
  await page.reload({ waitUntil: 'networkidle' })
  const violations = await scan(page)
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
})
