import { test, expect } from '@playwright/test';

test.describe('Интеграционные тесты конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/user.har', {
      url: /\/api\/auth\/user/,
      notFound: 'abort'
    });

    await page.routeFromHAR('tests/hars/orders.har', {
      url: /\/api\/orders/,
      notFound: 'abort',
      update: false
    });

    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: /\/api\/ingredients/,
      notFound: 'abort'
    });

    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      document.cookie = 'accessToken=Bearer mock-access-token; path=/';
    });

    await page.goto('/');
  });

  test('Добавление ингредиента из списка в конструктор', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' });
    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Филе Люминесцентного' });

    await expect(bunCard).toBeVisible({ timeout: 10000 });
    await expect(fillingCard).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).not.toBeVisible();

    await bunCard.getByRole('button').click();

    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).toBeVisible({ timeout: 5000 });

    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).not.toBeVisible();

    await fillingCard.getByRole('button').click();

    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).toBeVisible({ timeout: 5000 });
  });

  test('Открытие и закрытие модального окна с описанием ингредиента', async ({
    page
  }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' });
    await expect(bunCard).toBeVisible({ timeout: 10000 });

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible();

    await bunCard.getByRole('link').first().click();

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible({ timeout: 5000 });

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Краторная булка N-200i' })
    ).toBeVisible();

    // ✅ Стабильный локатор: кнопка внутри модалки
    await page.locator('#modals').getByRole('button').click();

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Закрытие модального окна по клику на оверлей', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' });
    await expect(bunCard).toBeVisible({ timeout: 10000 });

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible();

    await bunCard.getByRole('link').first().click();

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible({ timeout: 5000 });

    await page.mouse.click(10, 10);

    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Процесс создания заказа', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' });
    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Филе Люминесцентного' });

    await expect(bunCard).toBeVisible({ timeout: 10000 });

    await expect(page.locator('#modals').getByText('45678')).not.toBeVisible();

    await bunCard.getByRole('button').click();
    await fillingCard.getByRole('button').click();

    // ✅ Современный локатор getByRole вместо строкового page.click
    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page.locator('#modals').getByText('45678')).toBeVisible({
      timeout: 5000
    });

    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).not.toBeVisible({ timeout: 5000 });

    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).not.toBeVisible({ timeout: 3000 });

    // ✅ Стабильный локатор: кнопка внутри модалки
    await page.locator('#modals').getByRole('button').click();

    await expect(page.locator('#modals').getByText('45678')).not.toBeVisible({
      timeout: 3000
    });
  });
});
