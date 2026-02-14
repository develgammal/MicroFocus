import { test, expect } from '@playwright/test'

test.describe('Break Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('can change focus interval in settings', async ({ page }) => {
    // Open settings
    await page.getByRole('button', { name: /open settings/i }).click()

    // Change interval to 0.1 minutes (6 seconds) for fast testing
    const intervalInput = page.locator('#interval-input')
    await intervalInput.fill('0.1')

    // Timer should update to 00:06
    await expect(page.getByText('00:06')).toBeVisible()
  })
})
