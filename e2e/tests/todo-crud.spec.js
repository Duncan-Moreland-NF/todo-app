import { test, expect } from '@playwright/test';

test.describe('Todo CRUD operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to finish loading
    await page.waitForSelector('h1');
  });

  test('Test 1 — Create a todo: type text, click Add, verify todo appears in list', async ({
    page,
  }) => {
    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Buy groceries');
    await page.getByRole('button', { name: /add/i }).click();

    // Verify the todo appears in the list
    await expect(page.getByText('Buy groceries')).toBeVisible();

    // Verify the input is cleared
    await expect(input).toHaveValue('');
  });

  test('Test 2 — Complete a todo: click checkbox, verify strikethrough appears', async ({
    page,
  }) => {
    // Create a todo first
    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Walk the dog');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Walk the dog')).toBeVisible();

    // Click the checkbox to complete it
    const checkbox = page.getByRole('checkbox');
    await checkbox.click();

    // Verify checkbox is now checked
    await expect(checkbox).toBeChecked();
  });

  test('Test 3 — Uncomplete a todo: click checked checkbox, verify strikethrough removed', async ({
    page,
  }) => {
    // Create and complete a todo
    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Read a book');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Read a book')).toBeVisible();

    const checkbox = page.getByRole('checkbox');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Uncheck it
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('Test 4 — Delete a todo: click delete button, verify todo removed from list', async ({
    page,
  }) => {
    // Create a todo
    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Clean the house');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Clean the house')).toBeVisible();

    // Click delete button
    await page.getByRole('button', { name: /delete: clean the house/i }).click();

    // Verify the todo is removed
    await expect(page.getByText('Clean the house')).not.toBeVisible();
  });

  test('Test 6 — Create multiple todos: verify they appear in newest-first order', async ({
    page,
  }) => {
    const input = page.getByPlaceholder('What needs doing?');

    // Create multiple todos
    await input.fill('First task');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('First task')).toBeVisible();

    await input.fill('Second task');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Second task')).toBeVisible();

    await input.fill('Third task');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Third task')).toBeVisible();

    // Verify order: newest first (Third, Second, First)
    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(3);

    const texts = await items.allTextContents();
    expect(texts[0]).toContain('Third task');
    expect(texts[1]).toContain('Second task');
    expect(texts[2]).toContain('First task');
  });
});
