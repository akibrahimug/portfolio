import { test, expect } from '@playwright/test'

test('shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/#contact', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /send message/i }).click()
  await expect(page.getByText('Please tell me your name.')).toBeVisible()
  await expect(page.getByText('Email is required.')).toBeVisible()
  await expect(page.getByText('Add a message.')).toBeVisible()
})

test('submits a valid message and confirms success', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }),
  )
  await page.goto('/#contact', { waitUntil: 'networkidle' })
  await page.getByPlaceholder('Your name').fill('Jane Recruiter')
  await page.getByPlaceholder(/you@company/i).fill('jane@example.com')
  await page.getByPlaceholder(/what would you like to build/i).fill('Can we talk about a senior role?')
  await page.getByRole('button', { name: /send message/i }).click()
  await expect(page.getByRole('status')).toContainText(/reply within a day/i)
})
