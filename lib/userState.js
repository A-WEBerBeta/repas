import { supabase } from "@/lib/supabase";

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new error("Utilisateur non connecté");
  }

  return user;
}

export async function loadUserState() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("user_state")
    .select(
      `
        recipes,
        ingredients,
        planning,
        shopping_lists,
        shopping_days,
        updated_at
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
    updatedAt: data?.updated_at || null,
  };
}

export async function saveUserState(changes) {
  const user = await getCurrentUser();

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

  return true;
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
