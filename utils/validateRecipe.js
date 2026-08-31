export function validateRecipe({ name, portions, ingredients }) {
  const errors = {
    name: "",
    portions: "",
    ingredients: "",
    ingredientRows: {},
  };

  if (!name.trim()) {
    errors.name = "Donne un nom à la recette.";
  }

  if (!portions || Number(portions) < 1) {
    errors.portions = "Il faut au moins 1 portion.";
  }

  if (ingredients.length === 0) {
    errors.ingredients = "Ajoute au moins un ingrédient.";
  }

  const selectedIds = [];

  ingredients.forEach((ingredient) => {
    const rowErrors = {};

    if (!ingredient.ingredientId) {
      rowErrors.ingredient = "Choisis un ingrédient.";
    }

    if (ingredient.quantity === "" || Number(ingredient.quantity) <= 0) {
      rowErrors.quantity = "Quantité invalide.";
    }

    if (
      ingredient.ingredientId &&
      selectedIds.includes(ingredient.ingredientId)
    ) {
      rowErrors.ingredient = "Cet ingrédient est déjà présent.";
    }

    if (ingredient.ingredientId) {
      selectedIds.push(ingredient.ingredientId);
    }

    if (Object.keys(rowErrors).length > 0) {
      errors.ingredientRows[ingredient.id] = rowErrors;
    }
  });

  const isValid =
    !errors.name &&
    !errors.portions &&
    !errors.ingredients &&
    Object.keys(errors.ingredientRows).length === 0;

  return {
    isValid,
    errors,
  };
}
