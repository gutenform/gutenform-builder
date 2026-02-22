import { test, expect } from '@playwright/test';

test.describe('Auth pages', () => {
  test('login page loads and has form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Login/i })).toBeVisible();
    await expect(page.getByLabel(/E-Mail/i)).toBeVisible();
    await expect(page.getByLabel(/Passwort/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Anmelden/i })).toBeVisible();
  });

  test('signup page loads and has form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /Registrieren/i })).toBeVisible();
    await expect(page.getByLabel(/E-Mail/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Konto erstellen/i })).toBeVisible();
  });

  test('unauthenticated user visiting /app is redirected to login', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/);
  });
});
