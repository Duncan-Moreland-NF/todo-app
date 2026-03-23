import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('keyboard navigation works through all interactive elements', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Create a todo so we have interactive elements to tab through
    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Accessible task');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Accessible task')).toBeVisible();

    // Focus the input
    await input.focus();
    await expect(input).toBeFocused();

    // Tab to Add button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /add/i })).toBeFocused();

    // Tab to checkbox
    await page.keyboard.press('Tab');
    await expect(page.getByRole('checkbox')).toBeFocused();

    // Tab to delete button
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: /delete: accessible task/i }),
    ).toBeFocused();
  });

  test('LoadingSpinner has correct ARIA attributes', async ({ page }) => {
    // Intercept the API to delay response so we can catch the loading state
    await page.route('**/api/todos', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    // Check the loading spinner has correct attributes
    const spinner = page.getByRole('status');
    await expect(spinner).toHaveAttribute('aria-label', 'Loading todos');
  });

  test('semantic HTML structure is correct', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Check for semantic elements
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
