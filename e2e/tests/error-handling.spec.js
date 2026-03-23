import { test, expect } from '@playwright/test';

test.describe('Error handling', () => {
  test('placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Todo/);
  });
});
