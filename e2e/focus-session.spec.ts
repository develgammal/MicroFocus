import { test, expect } from '@playwright/test'

test.describe('Focus Session Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays the app header with MicroFocus branding', async ({ page }) => {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    await expect(header).toContainText('Micro')
    await expect(header).toContainText('Focus')
  })

  test('shows timer display with default 25:00', async ({ page }) => {
    await expect(page.getByText('25:00')).toBeVisible()
    await expect(page.getByText('Focus Session')).toBeVisible()
  })

  test('starts and pauses the timer', async ({ page }) => {
    // Start the timer
    const startBtn = page.getByRole('button', { name: /start focus/i })
    await expect(startBtn).toBeVisible()
    await startBtn.click()

    // Should now show Pause
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible()

    // Timer should change from 25:00 after ticking
    await expect(page.locator('.text-display')).not.toHaveText('25:00', { timeout: 5000 })

    // Pause the timer
    await page.getByRole('button', { name: /pause/i }).click()

    // Should now show Resume Focus
    await expect(page.getByRole('button', { name: /resume focus/i })).toBeVisible()
  })

  test('toggles settings panel', async ({ page }) => {
    // Settings should be hidden initially
    await expect(page.getByText('Focus Interval (Minutes)')).toBeHidden()

    // Click settings button
    await page.getByRole('button', { name: /open settings/i }).click()

    // Settings should be visible
    await expect(page.getByText('Focus Interval (Minutes)')).toBeVisible()
    await expect(page.locator('#interval-input')).toBeVisible()

    // Click again to close
    await page.getByRole('button', { name: /open settings/i }).click()
    await expect(page.getByText('Focus Interval (Minutes)')).toBeHidden()
  })

  test('toggles dark mode', async ({ page }) => {
    const html = page.locator('html')

    // Should start in light mode
    await expect(html).not.toHaveClass(/dark/)

    // Toggle dark mode
    await page.getByRole('button', { name: /toggle dark mode/i }).click()

    // Should now be in dark mode
    await expect(html).toHaveClass(/dark/)

    // Toggle back
    await page.getByRole('button', { name: /toggle dark mode/i }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('shows stats footer with initial values', async ({ page }) => {
    await expect(page.getByText('Avg Score')).toBeVisible()
    await expect(page.getByText('Sessions')).toBeVisible()
    await expect(page.getByText('Total Work')).toBeVisible()
  })

  test('shows productivity chart section', async ({ page }) => {
    await expect(page.getByText('Productivity Trend')).toBeVisible()
  })
})
