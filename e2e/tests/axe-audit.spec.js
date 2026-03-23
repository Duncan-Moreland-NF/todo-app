import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Helper: run axe-core and return the full results object.
 * Fails the test if any critical or serious violations are found.
 */
async function runAxeAudit(page, stateName) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();

  // Log all violations for the report regardless of severity
  if (results.violations.length > 0) {
    console.log(`\n=== axe-core violations for: ${stateName} ===`);
    for (const v of results.violations) {
      console.log(
        `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`,
      );
      for (const node of v.nodes) {
        console.log(`    - ${node.html}`);
        console.log(`      Fix: ${node.failureSummary}`);
      }
    }
  } else {
    console.log(`\n=== axe-core: ZERO violations for: ${stateName} ===`);
  }

  // Log summary stats
  console.log(`  Passes: ${results.passes.length}`);
  console.log(`  Violations: ${results.violations.length}`);
  console.log(`  Incomplete: ${results.incomplete.length}`);
  console.log(`  Inapplicable: ${results.inapplicable.length}`);

  return results;
}

test.describe('Accessibility Audit (axe-core)', () => {
  test('State 1 — Empty state (no todos): zero critical/serious WCAG violations', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Clear any existing todos
    while (true) {
      const deleteButtons = page.getByRole('button', { name: /^delete:/i });
      const count = await deleteButtons.count();
      if (count === 0) break;
      await deleteButtons.first().click();
      await page.waitForTimeout(300);
    }

    // Wait for empty state to render
    await expect(page.getByText('Nothing here yet')).toBeVisible();

    const results = await runAxeAudit(page, 'Empty State');

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      critical,
      `Found ${critical.length} critical/serious violation(s):\n${critical.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n')}`,
    ).toHaveLength(0);
  });

  test('State 2 — With todos: zero critical/serious WCAG violations', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Create some todos
    const input = page.getByPlaceholder('What needs doing?');
    for (const title of ['Buy groceries', 'Walk the dog', 'Read a book']) {
      await input.fill(title);
      await page.getByRole('button', { name: /add/i }).click();
      await expect(page.getByText(title)).toBeVisible();
    }

    const results = await runAxeAudit(page, 'With Todos');

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      critical,
      `Found ${critical.length} critical/serious violation(s):\n${critical.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n')}`,
    ).toHaveLength(0);
  });

  test('State 3 — With completed todos: zero critical/serious WCAG violations', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Make sure we have todos
    const input = page.getByPlaceholder('What needs doing?');
    await input.fill('Completed task audit');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Completed task audit')).toBeVisible();

    // Complete the first checkbox
    const checkboxes = page.getByRole('checkbox');
    await checkboxes.first().click();
    await expect(checkboxes.first()).toBeChecked();

    const results = await runAxeAudit(page, 'With Completed Todos');

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(
      critical,
      `Found ${critical.length} critical/serious violation(s):\n${critical.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join('\n')}`,
    ).toHaveLength(0);
  });
});
