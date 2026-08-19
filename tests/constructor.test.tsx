import { test, expect } from '@playwright/test';

test.describe('Интеграционные тесты конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Перехват запроса на эндпоинт ingredients с моковыми данными
    await page.route('**/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: '643d69a5c3f7b9001cfa093c',
              name: 'Краторная булка N-200i',
              type: 'bun',
              proteins: 80,
              fat: 24,
              carbohydrates: 53,
              calories: 420,
              price: 1255,
              image: 'https://code.s3.yandex.net/react/code/bun-02.png',
              image_mobile:
                'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
              image_large:
                'https://code.s3.yandex.net/react/code/bun-02-large.png'
            },
            {
              _id: '643d69a5c3f7b9001cfa0941',
              name: 'Филе Люминесцентного тетраодонтимформа',
              type: 'main',
              proteins: 44,
              fat: 26,
              carbohydrates: 85,
              calories: 643,
              price: 988,
              image: 'https://code.s3.yandex.net/react/code/meat-03.png',
              image_mobile:
                'https://code.s3.yandex.net/react/code/meat-03-mobile.png',
              image_large:
                'https://code.s3.yandex.net/react/code/meat-03-large.png'
            }
          ]
        })
      });
    });

    // 2. Моковые данные ответа на запрос данных пользователя
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            name: 'Test User',
            email: 'test@test.com',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z'
          }
        })
      });
    });

    // 3. Моковые данные ответа на запрос создания заказа
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            name: 'Флюоресцентный бургер',
            order: {
              _id: 'order123',
              status: 'done',
              name: 'Флюоресцентный бургер',
              owner: {
                name: 'Test User',
                email: 'test@test.com',
                createdAt: '2023-01-01T00:00:00.000Z',
                updatedAt: '2023-01-01T00:00:00.000Z'
              },
              createdAt: '2023-01-01T12:00:00.000Z',
              updatedAt: '2023-01-01T12:00:00.000Z',
              number: 45678,
              ingredients: [
                '643d69a5c3f7b9001cfa093c',
                '643d69a5c3f7b9001cfa0941',
                '643d69a5c3f7b9001cfa093c'
              ]
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, orders: [] })
        });
      }
    });

    // 4. Подстановка моковых токенов авторизации
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      document.cookie = 'accessToken=mock-access-token; path=/';
    });

    // Переход на главную страницу
    await page.goto('/');

    // Ожидаем загрузки ингредиентов
    await page.waitForSelector('text=Краторная булка N-200i', {
      timeout: 10000
    });
  });

  test('Добавление булки и начинки в конструктор', async ({ page }) => {
    // Добавление булки
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunCard.getByRole('button').click();

    // Проверка, что булка добавилась
    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).toBeVisible({
      timeout: 5000
    });

    // Добавление начинки
    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Филе Люминесцентного' });
    await fillingCard.getByRole('button').click();

    // Проверка, что начинка добавилась
    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).toBeVisible({ timeout: 5000 });
  });

  test('Работа модального окна ингредиента: открытие и закрытие', async ({
    page
  }) => {
    // Открытие модального окна ингредиента
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('link')
      .first()
      .click();

    // Проверка, что модальное окно открылось
    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible({ timeout: 5000 });

    // Закрытие по клику на крестик (берем последнюю кнопку с SVG)
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .last()
      .click();

    // Проверка, что модальное окно закрылось
    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Закрытие модального окна по клику на оверлей', async ({ page }) => {
    // Открытие модального окна
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('link')
      .first()
      .click();
    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible({ timeout: 5000 });

    // Закрытие по клику на оверлей: клик по координатам за пределами модального окна
    await page.mouse.click(10, 10);

    // Проверка, что модальное окно закрылось
    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('Создание заказа: полный сценарий', async ({ page }) => {
    // Собираем бургер: добавляем булку
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunCard.getByRole('button').click();

    // Добавляем начинку
    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: 'Филе Люминесцентного' });
    await fillingCard.getByRole('button').click();

    // Вызываем клик по кнопке «Оформить заказ»
    await page.click('text=Оформить заказ');

    // Проверяется, что модальное окно открылось и номер заказа верный
    await expect(page.getByText('45678')).toBeVisible({ timeout: 5000 });

    // Проверяется, что элементы исчезли
    await expect(
      page.getByRole('img', { name: 'Краторная булка N-200i (верх)' })
    ).not.toBeVisible({
      timeout: 5000
    });
    await expect(
      page.getByRole('img', { name: 'Филе Люминесцентного тетраодонтимформа' })
    ).not.toBeVisible({ timeout: 3000 });

    // Закрывается модальное окно
    await page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .last()
      .click();

    // Проверяется успешность закрытия
    await expect(page.getByText('45678')).not.toBeVisible({ timeout: 3000 });
  });
});
