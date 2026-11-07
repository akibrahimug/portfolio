import { test, expect } from '@playwright/test'

test.describe('live demo (offline mode: real tools, no model)', () => {
  // Static example answer: the self-playing intro is covered separately below.
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }))

  test('opens on a real example answer, never an empty frame', async ({ page }) => {
    await page.goto('/#demo')
    const demo = page.locator('#demo')
    await expect(demo.getByText('“Show me his performance work”')).toBeVisible()
    await expect(demo.getByRole('link', { name: /EF EPI/ })).toBeVisible()
  })

  test('a suggested question streams back the matching component', async ({ page }) => {
    await page.goto('/#demo')
    const demo = page.locator('#demo')
    await demo.getByRole('button', { name: 'How do I hire him?' }).click()
    await expect(demo.getByText('“How do I hire him?”')).toBeVisible()
    await expect(demo.getByRole('link', { name: /Email Ibrahim/ })).toBeVisible()
  })

  test('free text is answered and "Show how" explains it honestly', async ({ page }) => {
    await page.goto('/#demo')
    const demo = page.locator('#demo')
    await demo.getByRole('textbox', { name: /Ask about Ibrahim/ }).fill('where has he worked?')
    await demo.getByRole('button', { name: /^Ask/ }).click()
    await expect(demo.getByRole('heading', { name: /EF Education First/ }).first()).toBeVisible()
    // Not a model answer, and the visitor is told so without opening the notes.
    await expect(demo.getByText(/comes straight from the site’s data/)).toBeVisible()
    await demo.getByRole('button', { name: 'Show how' }).click()
    const notes = demo.getByRole('complementary', { name: 'How this answer was made' })
    await expect(notes).toContainText('No model answered this one')
    await expect(notes).toContainText('getExperience')
    await expect(notes).toContainText('<Timeline />')
  })
})

test('specific questions get specific answers, even without a model', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#demo')
  const demo = page.locator('#demo')
  await demo.getByRole('textbox', { name: /Ask about Ibrahim/ }).fill('how many years of experience does he have with product sites')
  await demo.getByRole('button', { name: /^Ask/ }).click()
  await expect(demo.getByText(/^About \d+ years of professional frontend work, since Feb 2020/)).toBeVisible()
})

test('with motion, the demo plays its example answer once it is scrolled into view', async ({ page }) => {
  await page.goto('/')
  const demo = page.locator('#demo')
  await demo.scrollIntoViewIfNeeded()
  // It plays (busy), then lands on the finished example.
  await expect(demo.locator('[aria-busy=true]')).toHaveCount(1, { timeout: 8000 })
  await expect(demo.getByText('“Show me his performance work”')).toBeVisible({ timeout: 8000 })
  await expect(demo.getByRole('link', { name: /EF EPI/ })).toBeVisible({ timeout: 8000 })
  await expect(demo.locator('[aria-busy=true]')).toHaveCount(0, { timeout: 8000 })
})

test('no AI-product chrome: no tool chips or status pills, ever', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#demo')
  const demo = page.locator('#demo')
  await demo.getByRole('button', { name: "What's his stack?" }).click()
  await expect(demo.getByText(/stack, by depth/)).toBeVisible()
  await expect(demo.getByRole('list', { name: 'Tool calls' })).toHaveCount(0)
  await expect(demo.getByText(/^(getStack|findWork|getExperience|getImpact|getContact)$/)).toHaveCount(0)
  await expect(demo.getByText(/Streaming ·|Answered offline/i)).toHaveCount(0)
})

test('typing into the demo cancels the intro immediately', async ({ page }) => {
  await page.goto('/')
  const demo = page.locator('#demo')
  await demo.scrollIntoViewIfNeeded()
  await demo.getByRole('textbox', { name: /Ask about Ibrahim/ }).click()
  await expect(demo.locator('[aria-busy=true]')).toHaveCount(0)
  await expect(demo.getByRole('link', { name: /EF EPI/ })).toBeVisible()
})
