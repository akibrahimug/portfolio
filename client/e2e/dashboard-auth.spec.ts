import { test, expect } from '@playwright/test'

test.describe('dashboard auth', () => {
  test('redirects unauthenticated user to sign-in', async ({ page }) => {
    await page.goto('/dashboard')
    // Clerk redirects to /sign-in or shows the sign-in component.
    await expect(page).toHaveURL(/sign[-_]?in/i, { timeout: 15_000 })
  })
})
