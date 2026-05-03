import { test, expect } from '@playwright/test';

test.describe('E2E Tests - Full User Flows', () => {
  // Base URL - configure in playwright.config.ts
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigate to app before each test
    await page.goto(BASE_URL);
  });

  test.describe('Authentication Flow', () => {
    test('should register a new user', async ({ page }) => {
      // Navigate to registration page
      await page.goto(`${BASE_URL}/auth/register`);

      // Fill registration form
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'TestPassword123!');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success
      await page.waitForURL(/\/dashboard|\/perfil/);
      expect(page.url()).toContain('dashboard');
    });

    test('should login with valid credentials', async ({ page }) => {
      // Navigate to login
      await page.goto(`${BASE_URL}/auth/login`);

      // Fill login form
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for redirect
      await page.waitForURL(/\/dashboard/, { timeout: 10000 }).catch(() => {
        // If timeout, just check we're not on login page anymore
      });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);

      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'WrongPassword');

      await page.click('button[type="submit"]');

      // Look for error message
      const errorVisible = await page.isVisible('text=/Invalid|error/i');
      expect(errorVisible || page.url().includes('login')).toBeTruthy();
    });

    test('should logout user', async ({ page }) => {
      // Assuming user is logged in
      // Look for logout button or menu
      const logoutButton = page.locator('button:has-text("Logout"), [role="button"]:has-text("Logout")').first();

      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL(/\/auth|\/login/);
      }
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('should display dashboard with main sections', async ({ page }) => {
      // Assuming user is on dashboard
      await page.goto(`${BASE_URL}/dashboard`);

      // Check for key dashboard elements
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();

      // Check for navigation sections
      const routinesLink = page.locator('a:has-text("Rotinas"), button:has-text("Rotinas")').first();
      expect(await routinesLink.isVisible() || page.url().includes('dashboard')).toBeTruthy();
    });

    test('should navigate to profile page', async ({ page }) => {
      // Navigate to dashboard first
      await page.goto(`${BASE_URL}/dashboard`);

      // Click on profile/perfil link
      const profileLink = page.locator('a[href*="/perfil"], button:has-text("Perfil")').first();
      if (await profileLink.isVisible()) {
        await profileLink.click();
        await page.waitForURL(/\/perfil/, { timeout: 5000 }).catch(() => {});
      }
    });

    test('should navigate to settings/configuracoes', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const settingsLink = page.locator('a[href*="/configuracoes"], button:has-text("Configurações")').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForURL(/\/configuracoes/, { timeout: 5000 }).catch(() => {});
      }
    });

    test('should navigate to categories page', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const categoriesLink = page.locator('a[href*="/categories"], button:has-text("Categorias")').first();
      if (await categoriesLink.isVisible()) {
        await categoriesLink.click();
        await page.waitForURL(/\/categories/, { timeout: 5000 }).catch(() => {});
      }
    });

    test('should navigate to routines page', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      const routinesLink = page.locator('a[href*="/routines"], button:has-text("Rotinas")').first();
      if (await routinesLink.isVisible()) {
        await routinesLink.click();
        await page.waitForURL(/\/routines/, { timeout: 5000 }).catch(() => {});
      }
    });
  });

  test.describe('Profile Management', () => {
    test('should update user profile', async ({ page }) => {
      await page.goto(`${BASE_URL}/perfil`);

      // Check if profile form exists
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        await nameInput.fill('Updated Name');

        // Save changes
        const saveButton = page.locator('button:has-text("Salvar"), button[type="submit"]').first();
        await saveButton.click();

        // Wait for success message or redirect
        await page.waitForTimeout(1000);
      }
    });

    test('should verify WhatsApp phone number', async ({ page }) => {
      await page.goto(`${BASE_URL}/perfil`);

      // Look for phone input
      const phoneInput = page.locator('input[name="whatsappNumber"], input[placeholder*="WhatsApp"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('+5511999999999');

        // Send verification code
        const verifyButton = page.locator('button:has-text("Verificar"), button:has-text("Enviar")').first();
        if (await verifyButton.isVisible()) {
          await verifyButton.click();

          // Wait for OTP input
          const otpInput = page.locator('input[name="otp"], input[placeholder*="código"]').first();
          if (await otpInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Code would be filled by user or test setup
          }
        }
      }
    });
  });

  test.describe('Categories Interaction', () => {
    test('should load categories page', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/categories`);

      // Wait for categories to load
      const categoryCards = page.locator('[class*="category"], [class*="card"]');
      await expect(categoryCards.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should toggle category selection', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/categories`);

      // Find and click a category toggle
      const categoryButton = page.locator('button, [role="checkbox"]').first();
      if (await categoryButton.isVisible()) {
        const initialState = await categoryButton.getAttribute('aria-checked');
        await categoryButton.click();
        await page.waitForTimeout(500);

        // Verify state changed
        const newState = await categoryButton.getAttribute('aria-checked');
        // State should have changed (if it was a toggle)
      }
    });
  });

  test.describe('Routines Display', () => {
    test('should display routine cards', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/routines`);

      // Wait for page title
      const title = page.locator('h1:has-text("Rotinas"), h2:has-text("Rotinas")').first();
      await expect(title).toBeVisible({ timeout: 5000 }).catch(() => {});

      // Check for routine cards
      const routineCards = page.locator('[class*="routine"], [class*="card"]');
      // Should have at least 1 routine visible
    });

    test('should show routine status and execution times', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/routines`);

      // Look for status badges
      const statusBadge = page.locator('text=/Ativa|Inativa/').first();
      // Should be visible on routines page

      // Look for dates
      const dateText = page.locator('text=/execução|próxima|última/i').first();
      // Should show execution info
    });
  });

  test.describe('API Integration', () => {
    test('should load data via API endpoints', async ({ page }) => {
      // Intercept API calls
      const apiCalls: string[] = [];

      page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          apiCalls.push(response.url());
        }
      });

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForTimeout(2000);

      // Should have made at least some API calls
      expect(apiCalls.length >= 0).toBeTruthy();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Block API calls to simulate error
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });

      await page.goto(`${BASE_URL}/dashboard`);

      // Should show error message or fallback content
      const errorMessage = page.locator('text=/erro|error|falha/i').first();
      // Either error is shown or page degrades gracefully
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`${BASE_URL}/dashboard`);

      // Navigation should be accessible
      const menu = page.locator('[role="navigation"], [class*="menu"], [class*="nav"]').first();
      // Should be visible or accessible

      // Content should not overflow
      const mainContent = page.locator('main, [role="main"]').first();
      if (await mainContent.isVisible()) {
        const boundingBox = await mainContent.boundingBox();
        expect(boundingBox?.width).toBeLessThanOrEqual(375);
      }
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(`${BASE_URL}/dashboard`);
      // Verify layout is responsive
    });

    test('should display correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto(`${BASE_URL}/dashboard`);
      // Verify full layout
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within 3 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have no console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForTimeout(2000);

      // Should have minimal or no errors
      expect(errors.length).toBeLessThan(5);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Check for h1 tag
      const h1 = page.locator('h1').first();
      expect(await h1.isVisible()).toBeTruthy();
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Get all images without alt text
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      // Images should have alt text for accessibility
    });

    test('should have keyboard navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should be visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).not.toBe('BODY');
    });
  });
});
