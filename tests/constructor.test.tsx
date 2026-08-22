import { test, expect } from '@playwright/test';

test.describe('Интеграционные тесты конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Мокаем пользователя авторизованным
    await page.route('**/api/auth/user', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@test.com', name: 'Test User' },
        }),
      })
    );

    // Мокаем заказы
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            name: 'Флюоресцентный бургер',
            order: { number: 45678 },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Мокаем ингридиенты
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: /\/api\/ingredients/,
      update: false,
      notFound: 'fillfull',
    });

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      document.cookie = 'accessToken=mock-access-token; path=/';
    });

    await page.goto('/');
  });

  test('Добавление ингредиента из списка в конструктор', async ({ page }) => {
    const bunCard = page.getByRole('listitem').filter({ hasText: 'Краторная булка N-200i' });

    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).not.toBeVisible();

    await bunCard.getByRole('button').click();
    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).toBeVisible({ timeout: 5000 });

    const fillingCard = page.getByRole('listitem').filter({ hasText: 'Филе Люминесцентного' });

    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).not.toBeVisible();

    await fillingCard.getByRole('button').click();
    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).toBeVisible({ timeout: 5000 });
  });

  test('Открытие и закрытие модального окна с описанием ингредиента', async ({ page }) => {
    // Отсутствие модалки ДО клика (в контейнере #modals)
    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible();

    await page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('link')
      .first()
      .click();

    // Содержимое СТРОГО ВНУТРИ #modals
    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Краторная булка N-200i' })
    ).toBeVisible();

    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .last()
      .click();

    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Закрытие модального окна по клику на оверлей', async ({ page }) => {
    // Отсутствие модалки ДО клика (в контейнере #modals)
    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible();

    await page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('link')
      .first()
      .click();

    // Содержимое СТРОГО ВНУТРИ #modals
    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible({ timeout: 5000 });

    await page.mouse.click(10, 10);

    await expect(
      page.locator('#modals').getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Процесс создания заказа', async ({ page }) => {
    // Отсутствие номера заказа ДО оформления (в контейнере #modals)
    await expect(page.locator('#modals').getByText('45678')).not.toBeVisible();

    await page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button')
      .click();
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Филе Люминесцентного' })
      .getByRole('button')
      .click();

    await page.click('text=Оформить заказ');

    // Номер заказа СТРОГО ВНУТРИ #modals
    await expect(page.locator('#modals').getByText('45678')).toBeVisible({ timeout: 5000 });

    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).not.toBeVisible({ timeout: 3000 });

    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .last()
      .click();

    // Исчезновение номера заказа ВНУТРИ #modals
    await expect(page.locator('#modals').getByText('45678')).not.toBeVisible({ timeout: 3000 });
  });
});