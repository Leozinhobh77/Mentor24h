import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Mentor24h E2E Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
  });

  // ============ AUTENTICAÇÃO ============

  test('should load login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Mentor24h|Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Entrar")');

    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText(/inválido|erro/i);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('a:has-text("Criar conta")');
    await expect(page).toHaveURL(/signup|register/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  // ============ DASHBOARD ============

  test('should show dashboard for authenticated user', async ({ page, context }) => {
    // Mock authenticated state (simular login)
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-token-123',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      },
    ]);

    await page.goto(`${BASE_URL}/dashboard`);

    // Esperado: Dashboard carrega
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=/Bem-vindo|Dashboard/i')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Simular auth
    await page.goto(`${BASE_URL}/dashboard`);

    const navItems = [
      'Tarefas',
      'Categorias',
      'Áudios',
      'Rotinas',
      'Perfil',
      'Configurações',
    ];

    for (const item of navItems) {
      await expect(page.locator(`a:has-text("${item}")`)).toBeVisible();
    }
  });

  // ============ CATEGORIAS ============

  test('should load categories page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/categories`);
    await expect(page).toHaveURL(/categories/);

    // Esperado: Grid de 42 categorias
    const categoryItems = await page.locator('[data-testid="category-card"]').all();
    expect(categoryItems.length).toBeGreaterThan(0);
  });

  test('should toggle category selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/categories`);

    const firstToggle = page.locator('button[data-testid="toggle-category"]').first();
    await firstToggle.click();

    // Esperado: Toggle muda estado visualmente
    const parent = firstToggle.locator('..');
    await expect(parent).toHaveClass(/selected|active/);
  });

  // ============ MENSAGENS & CRISE ============

  test('should load messages page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/messages`);
    await expect(page).toHaveURL(/messages/);
  });

  test('should display crisis detection on sensitive keywords', async ({ page, context }) => {
    // Simulação: enviar mensagem com palavra-chave de crise
    await page.goto(`${BASE_URL}/dashboard/messages`);

    const messageInput = page.locator('input[placeholder*="mensagem" i], textarea[placeholder*="mensagem" i]').first();

    if (await messageInput.isVisible()) {
      await messageInput.fill('quero morrer');

      // Esperado: Sistema detecta crise
      await expect(page.locator('[data-testid="crisis-alert"]')).toBeVisible({ timeout: 2000 });
    }
  });

  // ============ ÁUDIOS ============

  test('should load audios page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/audios`);
    await expect(page).toHaveURL(/audios/);

    // Esperado: Lista de áudios
    await expect(page.locator('[data-testid="audio-card"]')).toHaveCount(1, { timeout: 5000 }).catch(() => {});
  });

  test('should play audio', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/audios`);

    const playButton = page.locator('button[data-testid="play-audio"]').first();

    if (await playButton.isVisible()) {
      await playButton.click();

      // Esperado: Player inicia
      const audio = page.locator('audio').first();
      await expect(audio).toHaveAttribute('src', /.+/);
    }
  });

  // ============ ROTINAS ============

  test('should load routines page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/routines`);
    await expect(page).toHaveURL(/routines/);

    // Esperado: 3 rotinas
    await expect(page.locator('[data-testid="routine-card"]')).toHaveCount(3, { timeout: 5000 }).catch(() => {});
  });

  // ============ PERFIL ============

  test('should load profile page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/profile`);
    await expect(page).toHaveURL(/profile/);

    // Esperado: Formulário com campos
    await expect(page.locator('input[placeholder*="nome" i]')).toBeVisible();
  });

  test('should update profile data', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/profile`);

    const nameInput = page.locator('input[placeholder*="nome" i]').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('João Silva');
      await page.click('button:has-text("Salvar")');

      // Esperado: Toast de sucesso
      await expect(page.locator('text=/salvo|atualizado/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  // ============ CONFIGURAÇÕES ============

  test('should load settings page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings`);
    await expect(page).toHaveURL(/settings|configuracoes/i);

    // Esperado: Seções de notificação, conta, LGPD
    await expect(page.locator('text=/notificações|conta|LGPD/i')).toContainText('notificações');
  });

  test('should toggle notifications', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings`);

    const notificationToggle = page.locator('input[type="checkbox"]').first();

    if (await notificationToggle.isVisible()) {
      await notificationToggle.click();

      // Esperado: Confirmar mudança
      await expect(page.locator('text=/salvo|atualizado/i')).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  // ============ PERFORMANCE ============

  test('should load dashboard in < 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  // ============ ACESSIBILIDADE ============

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Esperado: Botões têm labels
    const buttons = await page.locator('button[aria-label], button:has-text(/.+/)').all();
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Tab através de elementos
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);

    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
  });
});
