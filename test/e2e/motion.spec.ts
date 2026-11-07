import { test, expect } from '@playwright/test'

// Regression: GrowBar SSRs a `width:0` start state. Reduced-motion
// visitors must never be left with invisible content, without scrolling anything into view.
test('reduced motion: every bar is drawn at its value', async ({ page }) => {
  // `reducedMotion` is not a test.use fixture option; emulate it on the page.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  const collapsedBars = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-grow]')].filter(
      (el) => el.getBoundingClientRect().width === 0,
    ).length,
  )
  expect(collapsedBars).toBe(0)
})
