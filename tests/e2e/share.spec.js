import { test, expect } from '@playwright/test'
import path from 'path'
import { MOCK_SUGGESTIONS } from '../fixtures/mockSuggestions.js'

const FIXTURE = path.resolve('tests/fixtures/test-photo.png')
const MOCK_MEME = {
  id: 'test-meme-123',
  image_url: 'https://placehold.co/600x600/1c1c1c/f5e642?text=Test+Meme',
  template_id: 'drake',
  texts: { top: 'Test top', bottom: 'Test bottom' },
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analyze', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SUGGESTIONS) })
  })
  await page.route('**/api/share', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-meme-123', shareUrl: 'http://localhost:5173/m/test-meme-123' }),
      })
    }
  })
  await page.route('**/api/share/test-meme-123', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MEME) })
  })
  await page.route('**/api/react/test-meme-123', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ '😂': 3, '🔥': 1 }) })
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ '😂': 4, '🔥': 1 }) })
    }
  })
})

test('should load the share page and show reaction buttons', async ({ page }) => {
  await page.goto('/m/test-meme-123')

  await expect(page.locator('.share-page__image')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.reaction-btn')).toHaveCount(5)
})

test('should optimistically increment reaction count on click', async ({ page }) => {
  await page.goto('/m/test-meme-123')

  await expect(page.locator('.reaction-btn').first()).toBeVisible({ timeout: 5000 })
  const firstBtn = page.locator('.reaction-btn').first()
  const textBefore = await firstBtn.textContent()

  await firstBtn.click()

  await expect(async () => {
    const textAfter = await firstBtn.textContent()
    expect(textAfter).not.toBe(textBefore)
  }).toPass({ timeout: 3000 })
})
