import { FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useSelector } from '../../services/store';

export const IngredientDetails: FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const ingredients = useSelector((state) => state.ingredients.ingredients);

  const ingredientData =
    location.state?.ingredient ||
    ingredients.find((item) => item._id === id) ||
    null;

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
