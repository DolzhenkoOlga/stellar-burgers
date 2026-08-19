import { ingredientsReducer, fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

describe('Тесты редьюсера ingredientsSlice', () => {
  const mockIngredient: TIngredient = {
    _id: '1',
    name: 'Тестовая булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 20,
    calories: 100,
    price: 50,
    image: 'image.png',
    image_large: 'image_large.png',
    image_mobile: 'image_mobile.png'
  };

  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null
  };

  it('должен вернуть начальное состояние при передаче undefined и неизвестного экшена', () => {
    const newState = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(newState).toEqual(initialState);
  });

  it('должен обработать fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('должен обработать fetchIngredients.fulfilled', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: [mockIngredient]
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual([mockIngredient]);
  });

  it('должен обработать fetchIngredients.rejected', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Ошибка загрузки ингредиентов' }
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки ингредиентов');
  });
});
