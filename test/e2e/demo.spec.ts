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

// --- The sticky ask bar: the demo's stand-in while the section is out of view -------------
const bar = (page: import('@playwright/test').Page) => page.locator('#ask')
const panel = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Answer' })

test.describe('sticky ask bar', () => {
  test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }))

  test('hidden over the hero and over the demo section; shown everywhere else', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(bar(page)).toHaveAttribute('inert', '')
    await page.goto('/#demo', { waitUntil: 'networkidle' })
    await expect(bar(page)).toHaveAttribute('inert', '')
    await page.goto('/#experience', { waitUntil: 'networkidle' })
    await expect(bar(page)).not.toHaveAttribute('inert', '')
    expect(await bar(page).evaluate((el) => el.getBoundingClientRect().top)).toBe(64) // under the nav
  })

  test('one conversation: a question asked in the section is there when you open the bar', async ({ page }) => {
    await page.goto('/#demo', { waitUntil: 'networkidle' })
    await page.locator('#demo').getByRole('button', { name: 'How do I hire him?' }).click()
    await expect(page.locator('#demo').getByRole('link', { name: /Email Ibrahim/ })).toBeVisible()
    await page.locator('#experience').scrollIntoViewIfNeeded()
    await expect(bar(page)).not.toHaveAttribute('inert', '')
    await page.getByRole('textbox', { name: 'Ask AI' }).focus()
    await expect(panel(page).getByText('“How do I hire him?”')).toBeVisible()
  })

  test('asking from the bar opens the answer over the page; Esc closes it in place', async ({ page }) => {
    await page.goto('/#experience', { waitUntil: 'networkidle' })
    await page.waitForFunction(() => new Promise((r) => { const a = scrollY; setTimeout(() => r(scrollY === a), 250) }))
    // "In place" is visual: what the reader was looking at stays put on screen. (scrollY itself may
    // change: the answer also updates the demo section above, and scroll anchoring compensates.)
    const heading = page.locator('#experience h2')
    const before = Math.round((await heading.boundingBox())!.y)
    await page.getByRole('textbox', { name: 'Ask AI' }).fill('where has he worked?')
    await bar(page).getByRole('button', { name: /^Ask/ }).click()
    await expect(panel(page).getByRole('heading', { name: /EF Education First/ }).first()).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel(page)).toHaveCount(0)
    expect(Math.round((await heading.boundingBox())!.y)).toBe(before)
  })

  test('on case-study pages the bar is always there, and following an answer link closes it', async ({ page }) => {
    await page.goto('/work/learner', { waitUntil: 'networkidle' })
    await expect(bar(page)).not.toHaveAttribute('inert', '')
    await page.getByRole('textbox', { name: 'Ask AI' }).focus()
    await panel(page).getByRole('button', { name: 'Show me his performance work' }).click()
    await panel(page).getByRole('link', { name: /EF EPI/ }).click()
    await expect(page).toHaveURL(/\/work\/ef-epi$/)
    await expect(panel(page)).toHaveCount(0)
  })

  test('the hero button goes to the demo section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Ask AI (Live Demo)' }).click()
    await expect(page.locator('#demo')).toBeInViewport({ ratio: 0.2 })
  })
})
