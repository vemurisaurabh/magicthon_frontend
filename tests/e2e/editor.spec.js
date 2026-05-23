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

  await page.goto('/')
  const fileInput = page.locator('.upload-zone__input')
  await fileInput.setInputFiles(FIXTURE)
  await page.locator('.analyze-cta').click()
  await expect(page.locator('.suggestion-card')).toHaveCount(6, { timeout: 10000 })
  await page.locator('.suggestion-card').first().click()
  await expect(page.locator('.editor-page')).toBeVisible({ timeout: 5000 })
})

test('should update canvas text when input is changed', async ({ page }) => {
  const canvas = page.locator('canvas').first()
  await canvas.click()

  const textarea = page.locator('.canvas-editor__textarea')
  if (await textarea.isVisible()) {
    await textarea.clear()
    await textarea.fill('Playwright was here')
    await expect(textarea).toHaveValue('Playwright was here')
  }
})

test('should enable the Export PNG button after canvas loads', async ({ page }) => {
  const exportBtn = page.locator('.editor-toolbar__export')
  await expect(exportBtn).toBeVisible()
})

test('should trigger a file download when Export PNG is clicked', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download')
  await page.locator('.editor-toolbar__export').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.png$/)
})
