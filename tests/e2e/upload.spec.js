import { test, expect } from '@playwright/test'
import path from 'path'

const FIXTURE = path.resolve('tests/fixtures/test-photo.png')

test('should accept a photo upload and show the analyze button active', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.upload-zone__droparea')).toBeVisible()

  const fileInput = page.locator('.upload-zone__input')
  await fileInput.setInputFiles(FIXTURE)

  await expect(page.locator('.upload-zone__preview')).toBeVisible()

  const cta = page.locator('.analyze-cta')
  await expect(cta).not.toBeDisabled()
})

test('should show CTA button as disabled when no file is selected', async ({ page }) => {
  await page.goto('/')
  const cta = page.locator('.analyze-cta')
  await expect(cta).toBeDisabled()
})
