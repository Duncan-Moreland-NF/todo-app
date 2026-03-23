import { test, expect } from '@playwright/test';

test.describe('Error handling', () => {
  test('shows app title and header', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Todo/);
    await expect(page.getByRole('heading', { name: 'My Todos' })).toBeVisible();
  });

  test('Add button is disabled when input is empty', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    const addButton = page.getByRole('button', { name: /add/i });
    await expect(addButton).toBeDisabled();
  });

  test('Add button is enabled when input has text', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Some task');

    const addButton = page.getByRole('button', { name: /add/i });
    await expect(addButton).toBeEnabled();
  });
});
