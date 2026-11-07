import { test, expect } from '@playwright/test'

const SECTION_IDS = ['top', 'work', 'showcase', 'process', 'experience', 'skills', 'about', 'contact']

test('home loads with identity and every section', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Ibrahim Kasoma/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/platforms/i)
  for (const id of SECTION_IDS) {
    await expect(page.locator(`#${id}`)).toBeAttached()
  }
})

test('anchor navigation reaches a section', async ({ page }) => {
  await page.goto('/#experience')
  await expect(page.locator('#experience')).toBeInViewport({ ratio: 0.05 })
})

test('opens a tech detail dialog and closes it', async ({ page }) => {
  await page.goto('/#skills')
  await page.getByRole('button', { name: /^React/ }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'React' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
