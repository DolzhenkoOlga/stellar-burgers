import {
  burgerConstructorReducer,
  addBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  resetConstructor,
  orderBurger
} from '../constructorSlice';
import { TIngredient, TConstructorIngredient, TOrder } from '@utils-types';

describe('Тесты редьюсера burgerConstructorSlice', () => {
  const mockBun: TIngredient = {
    _id: 'bun1',
    name: 'Краторная булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 100,
    price: 50,
    image: 'img.png',
    image_large: 'img_l.png',
    image_mobile: 'img_m.png'
  };

  const mockFilling: TIngredient = {
    _id: 'fill1',
    name: 'Филе тестовое',
    type: 'main',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 100,
    price: 50,
    image: 'img.png',
    image_large: 'img_l.png',
    image_mobile: 'img_m.png'
  };

  const initialState = {
    bun: null,
    ingredients: [],
    orderRequest: false,
    orderModalData: null
  };

  it('должен вернуть начальное состояние при передаче undefined и неизвестного экшена', () => {
    const newState = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });
    expect(newState).toEqual(initialState);
  });

  it('должен добавить булку (addBun)', () => {
    const state = burgerConstructorReducer(initialState, addBun(mockBun));
    expect(state.bun).toEqual(mockBun);
  });

  it('должен добавить ингредиент (addIngredient)', () => {
    const preparedAction = addIngredient(mockFilling);
    const state = burgerConstructorReducer(initialState, preparedAction);
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]._id).toBe('fill1');
    expect(typeof state.ingredients[0].id).toBe('string'); // проверка генерации uuid
  });

  it('должен удалить ингредиент (removeIngredient)', () => {
    const stateWithIngredients = {
      ...initialState,
      ingredients: [{ ...mockFilling, id: '123' } as TConstructorIngredient]
    };
    const state = burgerConstructorReducer(
      stateWithIngredients,
      removeIngredient(0)
    );
    expect(state.ingredients).toHaveLength(0);
  });

  it('должен переместить ингредиент (moveIngredient)', () => {
    const stateWithIngredients = {
      ...initialState,
      ingredients: [
        { ...mockFilling, id: '1' } as TConstructorIngredient,
        { ...mockFilling, id: '2' } as TConstructorIngredient
      ]
    };
    const state = burgerConstructorReducer(
      stateWithIngredients,
      moveIngredient({ from: 0, to: 1 })
    );
    expect(state.ingredients[0].id).toBe('2');
    expect(state.ingredients[1].id).toBe('1');
  });

  it('должен сбросить конструктор (resetConstructor)', () => {
    const filledState = {
      ...initialState,
      bun: mockBun,
      ingredients: [{ ...mockFilling, id: '123' } as TConstructorIngredient]
    };
    const state = burgerConstructorReducer(filledState, resetConstructor());
    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  it('должен обработать orderBurger.pending', () => {
    const action = { type: orderBurger.pending.type };
    const state = burgerConstructorReducer(initialState, action);
    expect(state.orderRequest).toBe(true);
  });

  it('должен обработать orderBurger.fulfilled', () => {
    const mockOrder = { _id: 'order1', number: 12345 } as unknown as TOrder;
    const action = {
      type: orderBurger.fulfilled.type,
      payload: { order: mockOrder, name: 'Тестовый бургер' }
    };
    const filledState = {
      ...initialState,
      bun: mockBun,
      ingredients: [{ ...mockFilling, id: '123' } as TConstructorIngredient]
    };
    const state = burgerConstructorReducer(filledState, action);
    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toEqual(mockOrder);
    expect(state.bun).toBeNull(); // конструктор очищен
    expect(state.ingredients).toEqual([]); // конструктор очищен
  });

  it('должен обработать orderBurger.rejected', () => {
    const action = { type: orderBurger.rejected.type };
    const state = burgerConstructorReducer(initialState, action);
    expect(state.orderRequest).toBe(false);
  });
});
