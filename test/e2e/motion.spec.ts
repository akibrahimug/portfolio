import { test, expect } from '@playwright/test'

// Regression: Reveal/GrowBar SSR an `opacity:0` / `width:0` start state. Reduced-motion
// visitors must never be left with invisible content, without scrolling anything into view.
test('reduced motion: every reveal block and bar is fully visible', async ({ page }) => {
  // `reducedMotion` is not a test.use fixture option; emulate it on the page.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
      (el) => getComputedStyle(el).opacity !== '1',
    ).length,
  )
  expect(hidden).toBe(0)
  const collapsedBars = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-grow]')].filter(
      (el) => el.getBoundingClientRect().width === 0,
    ).length,
  )
  expect(collapsedBars).toBe(0)
})
