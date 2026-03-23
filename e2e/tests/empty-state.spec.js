import { test, expect } from '@playwright/test';

test.describe('Empty state', () => {
  test('placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Todo/);
  });
});
