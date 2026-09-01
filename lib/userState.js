import { supabase } from "@/lib/supabase";

export async function loadUserState() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Utilisateur non connecté");
  }

  const { data, error } = await supabase
    .from("user_state")
    .select(
      `
        recipes,
        ingredients,
        planning,
        shopping_lists,
        shopping_days
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return {
    recipes: data?.recipes || [],
    ingredients: data?.ingredients || [],
    planning: data?.planning || {},
    shoppingLists: data?.shopping_lists || {},
    shoppingDays: data?.shopping_days || {},
  };
}

export async function saveUserState(changes) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Utilisateur non connecté");
  }

  const update = {
    updated_at: new Date().toISOString(),
  };

  if ("recipes" in changes) {
    update.recipes = changes.recipes;
  }

  if ("ingredients" in changes) {
    update.ingredients = changes.ingredients;
  }

  if ("planning" in changes) {
    update.planning = changes.planning;
  }

  if ("shoppingLists" in changes) {
    update.shopping_lists = changes.shoppingLists;
  }

  if ("shoppingDays" in changes) {
    update.shopping_days = changes.shoppingDays;
  }

  const { error } = await supabase
    .from("user_state")
    .update(update)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}
