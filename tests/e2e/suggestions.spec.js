import { test, expect } from '@playwright/test'
import path from 'path'
import { MOCK_SUGGESTIONS } from '../fixtures/mockSuggestions.js'

const FIXTURE = path.resolve('tests/fixtures/test-photo.png')

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analyze', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SUGGESTIONS),
    })
  })
})

test('should show 6 suggestion cards after upload and analyze', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('.upload-zone__input')
  await fileInput.setInputFiles(FIXTURE)

  await page.locator('.analyze-cta').click()

  await expect(page.locator('.analysis-loading__phrase').first()).toBeVisible({ timeout: 5000 })

  await expect(page.locator('.suggestion-card')).toHaveCount(6, { timeout: 10000 })

  const firstCard = page.locator('.suggestion-card').first()
  await expect(firstCard.locator('.suggestion-card__label')).toBeVisible()
  await expect(firstCard.locator('.suggestion-card__top-text')).toBeVisible()
  await expect(firstCard.locator('.suggestion-card__bottom-text')).toBeVisible()
})

test('should navigate to editor when a suggestion card is clicked', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('.upload-zone__input')
  await fileInput.setInputFiles(FIXTURE)
  await page.locator('.analyze-cta').click()

  await expect(page.locator('.suggestion-card')).toHaveCount(6, { timeout: 10000 })

  await page.locator('.suggestion-card').first().click()

  await expect(page.locator('.editor-page')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('.editor-toolbar')).toBeVisible()
})
