import { test, expect, type Page } from '@playwright/test'

// The demo is the sticky ask bar under the nav (offline mode in e2e: real tools, no model).
const bar = (page: Page) => page.locator('#ask')
const panel = (page: Page) => page.getByRole('region', { name: 'Answer' })

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }))

test('the bar is hidden over the hero, then sticks under the nav once you scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(bar(page)).toHaveAttribute('inert', '')
  await page.locator('#work').scrollIntoViewIfNeeded()
  await expect(bar(page)).not.toHaveAttribute('inert', '')
  const top = await bar(page).evaluate((el) => el.getBoundingClientRect().top)
  expect(top).toBe(64) // directly under the 4rem nav
})

test('the hero button opens and focuses the bar', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Ask AI (Live Demo)' }).click()
  await expect(page.getByRole('textbox', { name: 'Ask AI' })).toBeFocused()
  await expect(panel(page)).toBeVisible()
})

test('asking opens the answer beneath the bar, over the page, and Esc closes it in place', async ({ page }) => {
  await page.goto('/#experience', { waitUntil: 'networkidle' })
  const scrollBefore = await page.evaluate(() => scrollY)
  await page.getByRole('textbox', { name: 'Ask AI' }).fill('where has he worked?')
  await page.getByRole('button', { name: /^Ask/ }).click()
  await expect(panel(page).getByRole('heading', { name: /EF Education First/ }).first()).toBeVisible()
  await expect(panel(page).getByText(/comes straight from the site’s data/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel(page)).toHaveCount(0)
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore) // the reader never moved
})

test('suggested questions stream back the matching component; "Show how" is honest', async ({ page }) => {
  await page.goto('/#work', { waitUntil: 'networkidle' })
  await page.getByRole('textbox', { name: 'Ask AI' }).focus()
  await panel(page).getByRole('button', { name: 'How do I hire him?' }).click()
  await expect(panel(page).getByRole('link', { name: /Email Ibrahim/ })).toBeVisible()
  await panel(page).getByRole('button', { name: 'Show how' }).click()
  const notes = page.getByRole('complementary', { name: 'How this answer was made' })
  await expect(notes).toContainText('No model answered this one')
  await expect(notes).toContainText('<ContactCard />')
})

test('specific questions get specific answers, even without a model', async ({ page }) => {
  await page.goto('/#work', { waitUntil: 'networkidle' })
  await page.getByRole('textbox', { name: 'Ask AI' }).fill('how many years of experience does he have with product sites')
  await page.getByRole('button', { name: /^Ask/ }).click()
  await expect(panel(page).getByText(/^About \d+ years of professional frontend work, since Feb 2020/)).toBeVisible()
})

test('the bar is on case-study pages too, and its project cards link into them', async ({ page }) => {
  await page.goto('/work/learner', { waitUntil: 'networkidle' })
  await expect(bar(page)).not.toHaveAttribute('inert', '')
  await page.getByRole('textbox', { name: 'Ask AI' }).focus()
  await panel(page).getByRole('button', { name: 'Show me his performance work' }).click()
  await panel(page).getByRole('link', { name: /EF EPI/ }).click()
  await expect(page).toHaveURL(/\/work\/ef-epi$/)
  await expect(panel(page)).toHaveCount(0) // following a suggestion closes the panel
})

test('loading straight onto a section (/#work) shows the bar, ready to type', async ({ page }) => {
  await page.goto('/#work', { waitUntil: 'networkidle' })
  await expect(bar(page)).not.toHaveAttribute('inert', '')
  await page.getByRole('textbox', { name: 'Ask AI' }).fill('does he know react?')
  await expect(page.getByRole('button', { name: /^Ask/ })).toBeEnabled()
})

test('no AI-product chrome: no tool chips or status pills, ever', async ({ page }) => {
  await page.goto('/#work', { waitUntil: 'networkidle' })
  await page.getByRole('textbox', { name: 'Ask AI' }).focus()
  await panel(page).getByRole('button', { name: "What's his stack?" }).click()
  await expect(panel(page).getByText(/stack, by depth/)).toBeVisible()
  await expect(page.getByText(/^(getStack|findWork|getExperience|getImpact|getContact)$/)).toHaveCount(0)
  await expect(page.getByText(/Streaming ·|Answered offline/i)).toHaveCount(0)
})
