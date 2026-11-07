import { test, expect } from '@playwright/test'

// The smallest phones in use: nothing may scroll sideways.
for (const width of [320, 390]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const path of ['/', '/work/ef-epi', '/work/learner']) {
      await page.goto(path, { waitUntil: 'networkidle' })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(overflow, `${path} scrolls sideways at ${width}px`).toBeLessThanOrEqual(0)
    }
  })
}
