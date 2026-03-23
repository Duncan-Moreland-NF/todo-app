import { test, expect } from '@playwright/test';

test.describe('Empty state', () => {
  test('Test 5 — Load app with no todos, verify "Nothing here yet" message', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for loading to finish — either empty state or todo list should appear
    await page.waitForSelector('h1');

    // If there are existing todos, delete them all first
    while (true) {
      const deleteButtons = page.getByRole('button', { name: /^delete:/i });
      const count = await deleteButtons.count();
      if (count === 0) break;
      await deleteButtons.first().click();
      // Wait for the item to be removed
      await page.waitForTimeout(300);
    }

    // Now verify the empty state message
    await expect(page.getByText('Nothing here yet')).toBeVisible();
    await expect(
      page.getByText('Add your first task above to get started'),
    ).toBeVisible();
  });
});
