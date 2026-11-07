import { test, expect } from '@playwright/test'

test('home links into a case study, which links on to the next', async ({ page }) => {
  await page.goto('/#work')
  await page.getByRole('link', { name: 'Read the EF EPI case study' }).click()
  await expect(page).toHaveURL(/\/work\/ef-epi$/)
  await expect(page.getByRole('heading', { level: 1, name: 'EF EPI' })).toBeVisible()
  await expect(page).toHaveTitle(/EF EPI: case study/)
  for (const chapter of ['The project', 'The problem', 'What I did', 'What changed']) {
    await expect(page.getByRole('heading', { level: 2, name: chapter })).toBeVisible()
  }
  await page.getByRole('link', { name: /Next case study/ }).click()
  await expect(page).toHaveURL(/\/work\/ef-pg$/)
  await expect(page.getByRole('heading', { level: 1, name: 'EF Programs' })).toBeVisible()
})

test('every case study page renders with its screenshot and canonical URL', async ({ page }) => {
  for (const slug of ['ef-epi', 'ef-pg', 'ef-homepage', 'learner', 'comp-lib']) {
    const res = await page.goto(`/work/${slug}`)
    expect(res?.status()).toBe(200)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(`/work/${slug}$`))
    const img = page.locator('main img').first()
    await expect(img).toBeVisible()
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  }
})

test('unknown case study slugs 404', async ({ page }) => {
  const res = await page.goto('/work/not-a-project')
  expect(res?.status()).toBe(404)
})

test('demo project cards link into the case studies', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#demo')
  await page.locator('#demo').getByRole('link', { name: /EF EPI/ }).click()
  await expect(page).toHaveURL(/\/work\/ef-epi$/)
})
