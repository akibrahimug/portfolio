import { test, expect } from '@playwright/test'

test.describe('live demo (offline mode: real tools, no model)', () => {
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
    await demo.getByRole('button', { name: 'Show how' }).click()
    const notes = demo.getByRole('complementary', { name: 'How this answer was made' })
    await expect(notes).toContainText('No model answered this one')
    await expect(notes).toContainText('getExperience')
    await expect(notes).toContainText('<Timeline />')
  })
})
