import { test, expect } from '@playwright/test';

test.describe('Auth Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /login \/ sign up/i }).click();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('shows validation errors when submitting empty login form', async ({ page }) => {
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows error message for incorrect credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText('Invalid credentials!')).toBeVisible();
  });

  test('allows user to switch to sign up form', async ({ page }) => {
    await page.getByRole('button', {  name: 'Sign Up', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  });

  test('allows user to switch to sign up form via the footer button', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  });
 
  test('shows validation errors when submitting empty sign up form', async ({ page }) => {
    await page.getByRole('button', {  name: 'Sign Up', exact: true }).click();
    await page.getByRole('button', {  name: 'Sign Up', exact: true }).last().click();

    await expect(page.getByText('User name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows error message for existing user', async ({ page }) => {
    await page.route('**/auth/signup', (route) => {                                                                                                         
      route.fulfill({                                                                                                                                       
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'email or username already exists' }),
      });
    });

    await page.getByRole('button', {  name: 'Sign Up', exact: true }).click();
    await page.getByLabel('Username').fill('newuser');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('Password123.');
    await page.getByRole('button', { name: 'Sign Up' }).last().click();

    await expect(page.getByText('Email or username already exists!')).toBeVisible(); 
  });

  test('successfully signs up', async ({ page }) => {
    await page.route('**/api/auth/signup', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id: 1, email: 'new@example.com', username: 'newuser' } }),
      });
    });

    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await page.getByLabel('Email').fill('new@example.com');
    await page.getByLabel('Password').fill('Password1');
    await page.getByLabel('Username').fill('newuser');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).last().click();

    await expect(page.getByRole('heading', { name: 'Sign Up' })).not.toBeVisible();
  });

  test('successfully logs in', async ({ page }) => {
    await page.route('**/api/auth/login', (route) => {                                                                                                            route.fulfill({                                                                                                                                       
        status: 200,                                                                                                                                        
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-token', user: { id: 1, email: 'user@example.com', username: 'existinguser', totalXP: 0, isEmailVerified: true }
  }),
      });
    });

    await page.route('**/api/workouts', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/achievements/user', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('Password1');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByRole('heading', { name: 'Login' })).not.toBeVisible();
  });
});
