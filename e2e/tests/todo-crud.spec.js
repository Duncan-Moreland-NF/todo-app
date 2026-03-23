import { test, expect } from '@playwright/test';

test.describe('Todo CRUD', () => {
  test('placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Todo/);
  });
});
