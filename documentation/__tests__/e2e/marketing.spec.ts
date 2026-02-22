import { test, expect } from '@playwright/test';

test.describe('Marketing pages', () => {
  test('homepage loads and has CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Formulare bauen mit KI/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Kostenlos starten/i })).toBeVisible();
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /Pricing/i })).toBeVisible();
  });

  test('features page loads', async ({ page }) => {
    await page.goto('/features');
    await expect(page.getByRole('heading', { name: /Features/i })).toBeVisible();
  });

  test('navigation to login from homepage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Login/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
