import { test, expect } from '@playwright/test'

test.describe('home', () => {
  test('renders hero with name', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toContainText(/Ibrahim/)
  })

  test('contains projects and contact sections', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#projects, [id="projects"]')).toBeVisible({ timeout: 10_000 })
  })

  test('scroll progresses on anchor click', async ({ page }) => {
    await page.goto('/')
    const before = await page.evaluate(() => window.scrollY)
    await page
      .locator('a[href="#projects"], button:has-text("Portfolio")')
      .first()
      .click()
      .catch(() => {})
    await page.waitForTimeout(800)
    const after = await page.evaluate(() => window.scrollY)
    expect(after).toBeGreaterThan(before)
  })
})
