import { test, expect } from '@playwright/test'

test('theme toggle flips and persists across reload', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  const initialDark = await html.evaluate((el) => el.classList.contains('dark'))

  await page.getByRole('button', { name: /toggle color scheme/i }).click()
  await expect.poll(() => html.evaluate((el) => el.classList.contains('dark'))).toBe(!initialDark)

  await page.reload()
  await expect.poll(() => html.evaluate((el) => el.classList.contains('dark'))).toBe(!initialDark)
})
