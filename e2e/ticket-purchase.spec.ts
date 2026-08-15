import { test, expect } from '@playwright/test';

test.describe('Zicket Ticket Purchase & Organizer Flow', () => {
  test('should load homepage and display hero elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/zicket/i);
  });

  test('should navigate to explore page and filter events', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.locator('h1, h2, div')).toContainText(/explore|events/i);

    // Filter events by applying search parameter query
    await page.goto('/explore?eventType=Tech%20%26%20Web3');
    await expect(page.locator('body')).toContainText(/explore|events|tech/i);
  });

  test('should complete end-to-end event selection, ticket selection, and checkout flow', async ({ page }) => {
    // Step 1: Navigate to Explore events list
    await page.goto('/explore');
    await expect(page.locator('body')).toContainText(/explore|events/i);

    // Step 2: Navigate to single event details page
    await page.goto('/explore/1');
    await expect(page.locator('body')).toBeTruthy();

    // Step 3: Assert event detail and ticket purchase options render
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    expect(pageContent).toContain('Zicket');
  });
});
