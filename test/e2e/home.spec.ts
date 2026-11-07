import { test, expect } from '@playwright/test'

const SECTION_IDS = ['top', 'demo', 'work', 'experience', 'about', 'contact']

test('home loads with identity and every section', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Ibrahim Kasoma/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/AI-native interfaces/i)
  for (const id of SECTION_IDS) {
    await expect(page.locator(`#${id}`)).toBeAttached()
  }
})

test('anchor navigation reaches a section', async ({ page }) => {
  await page.goto('/#experience')
  await expect(page.locator('#experience')).toBeInViewport({ ratio: 0.05 })
})
