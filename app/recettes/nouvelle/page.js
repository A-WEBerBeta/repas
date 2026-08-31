"use client";

import MobileNav from "@/components/MobileNav";
import RecipeImagePicker from "@/components/RecipeImagePicker";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";

import { defaultIngredients } from "@/data/defaultIngredients";
import { units } from "@/data/units";
import { pluralizeUnit } from "@/utils/formatUnit";
import { validateRecipe } from "@/utils/validateRecipe";

import { ArrowLeft, ChevronDown, Plus, Save, Utensils, X } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const emptyErrors = {
  name: "",
  portions: "",
  ingredients: "",
  ingredientRows: {},
};

export default function NewRecipePage() {
  const router = useRouter();

  const { showToast } = useToast();

  const [availableIngredients, setAvailableIngredients] = useState([]);

  const [name, setName] = useState("");

  const [portions, setPortions] = useState(2);

  const [instructions, setInstructions] = useState("");

  const [ingredients, setIngredients] = useState([]);

  const [image, setImage] = useState("");

  const [errors, setErrors] = useState(emptyErrors);

  useEffect(() => {
    const storedIngredients = localStorage.getItem("ingredients");

    if (storedIngredients) {
      setAvailableIngredients(JSON.parse(storedIngredients));
    } else {
      setAvailableIngredients(defaultIngredients);

      localStorage.setItem("ingredients", JSON.stringify(defaultIngredients));
    }
  }, []);

  function clearGeneralIngredientError() {
    setErrors((current) => ({
      ...current,
      ingredients: "",
    }));
  }

  function clearRowError(id, field) {
    setErrors((current) => ({
      ...current,

      ingredientRows: {
        ...current.ingredientRows,

        [id]: {
          ...current.ingredientRows[id],
          [field]: "",
        },
      },
    }));
  }

  function addIngredient() {
    clearGeneralIngredientError();

    setIngredients((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ingredientId: "",
        quantity: "",
        unit: "g",
      },
    ]);
  }

  function updateIngredient(id, changes) {
    setIngredients((current) =>
      current.map((ingredient) =>
        ingredient.id === id
          ? {
              ...ingredient,
              ...changes,
            }
          : ingredient,
      ),
    );
  }

  function removeIngredient(id) {
    setIngredients((current) =>
      current.filter((ingredient) => ingredient.id !== id),
    );

    setErrors((current) => {
      const updatedRows = {
        ...current.ingredientRows,
      };

      delete updatedRows[id];

      return {
        ...current,
        ingredientRows: updatedRows,
      };
    });
  }

  function handleIngredientChange(rowId, selectedId) {
    const selectedIngredient = availableIngredients.find(
      (ingredient) => ingredient.id === selectedId,
    );

    updateIngredient(rowId, {
      ingredientId: selectedId,
      unit: selectedIngredient?.unit || "g",
    });

    clearRowError(rowId, "ingredient");

    clearGeneralIngredientError();
  }

  function handleQuantityChange(id, value) {
    updateIngredient(id, {
      quantity: value,
    });

    clearRowError(id, "quantity");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validation = validateRecipe({
      name,
      portions,
      ingredients,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);

      showToast("Il reste quelques champs à corriger", "info");

      return;
    }

    setErrors(emptyErrors);

    const newRecipe = {
      id: crypto.randomUUID(),
      name: name.trim(),
      baseServings: Number(portions),
      image,

      ingredients: ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: Number(ingredient.quantity),
        unit: ingredient.unit,
      })),

      instructions: instructions.trim(),
      createdAt: new Date().toISOString(),
    };

    const storedRecipes = localStorage.getItem("recipes");

    const currentRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];

    localStorage.setItem(
      "recipes",
      JSON.stringify([...currentRecipes, newRecipe]),
    );

    showToast("Recette créée");

    router.push("/recettes");
  }

  return (
    <main className="min-h-screen bg-surface-dark text-app-text">
      <div className="flex min-h-screen w-full">
        <Sidebar active="recipes" />

        <div className="min-w-0 flex-1 px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-14">
          {/* HEADER */}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full">
              <p className="text-xs tracking-[0.18em] text-accent uppercase">
                Mon carnet
              </p>

              <h1
                className="mt-2 text-4xl sm:text-5xl"
                style={{
                  fontFamily: "var(--font-playfair)",
                }}
              >
                Créer une recette
              </h1>

              <div className="mt-4 h-px w-1/2 bg-linear-to-r from-peach/80 via-peach/35 to-transparent" />

              <p className="mt-3 text-sm leading-6 text-muted">
                Ajoute une nouvelle recette à ton carnet et définis ses
                ingrédients, ses portions et sa préparation.
              </p>
            </div>

            <Link
              href="/recettes"
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/8 px-4 py-3 text-sm text-muted transition-colors hover:border-white/15 hover:bg-white/3 hover:text-app-text"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Retour aux recettes
            </Link>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 grid gap-6 min-[2200px]:grid-cols-[minmax(0,1fr)_300px]"
          >
            {/* MAIN */}

            <div className="min-w-0 space-y-5">
              {/* NAME + IMAGE */}

              <div className="grid gap-10 xl:grid-cols-2 xl:items-stretch">
                {/* NAME */}

                <section className="rounded-3xl border border-white/7 bg-surface p-6 sm:p-7">
                  <p className="text-xs tracking-[0.18em] text-peach uppercase">
                    Recette
                  </p>

                  <h2
                    className="mt-1 text-2xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Donne-lui un nom
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    Choisis un nom simple pour la retrouver facilement dans ton
                    carnet.
                  </p>

                  <div className="mt-6">
                    <label
                      htmlFor="name"
                      className="text-[10px] tracking-[0.15em] text-subtle uppercase"
                    >
                      Nom de la recette
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);

                        if (errors.name) {
                          setErrors((current) => ({
                            ...current,
                            name: "",
                          }));
                        }
                      }}
                      placeholder="Ex : Pâtes saumon"
                      className={`mt-2 w-full border-b bg-transparent px-0 py-3 text-2xl text-app-text outline-none transition-colors placeholder:text-subtle ${
                        errors.name
                          ? "border-red-500/60"
                          : "border-white/10 focus:border-peach/50"
                      }`}
                      style={{
                        fontFamily: "var(--font-playfair)",
                      }}
                    />

                    {errors.name && (
                      <p className="mt-2 text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>
                </section>

                {/* IMAGE */}

                <section className="flex h-full flex-col rounded-3xl border border-white/7 bg-surface p-6 sm:p-7">
                  <div className="grid h-full gap-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
                    <div className="min-w-0">
                      <p className="text-xs tracking-[0.18em] text-peach uppercase">
                        Photo
                      </p>

                      <h2
                        className="mt-1 text-2xl"
                        style={{
                          fontFamily: "var(--font-playfair)",
                        }}
                      >
                        Ajoute une image
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-muted">
                        Facultatif — une photo rendra ton carnet beaucoup plus
                        visuel.
                      </p>
                    </div>

                    <RecipeImagePicker
                      image={image}
                      onChange={setImage}
                      compact
                    />
                  </div>
                </section>
              </div>

              {/* INGREDIENTS */}

              <section className="rounded-3xl border border-white/7 bg-surface p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.18em] text-peach uppercase">
                      Ingrédients
                    </p>

                    <h2
                      className="mt-1 text-2xl"
                      style={{
                        fontFamily: "var(--font-playfair)",
                      }}
                    >
                      Ce qu’il te faut
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                      Ajoute les ingrédients et leurs quantités de référence.
                    </p>

                    {errors.ingredients && (
                      <p className="mt-2 text-xs text-red-400">
                        {errors.ingredients}
                      </p>
                    )}
                  </div>

                  {ingredients.length > 0 && (
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-peach/20 bg-peach/8 px-4 py-2.5 text-sm font-medium text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                    >
                      <Plus size={15} />
                      Ajouter
                    </button>
                  )}
                </div>

                {ingredients.length === 0 ? (
                  <button
                    type="button"
                    onClick={addIngredient}
                    className={`mt-6 w-full rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${
                      errors.ingredients
                        ? "border-red-500/40 bg-red-500/5"
                        : "border-white/10 bg-white/1 hover:border-peach/25 hover:bg-peach/2.5"
                    }`}
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-peach/8 text-peach cursor-pointer">
                      <Plus size={18} />
                    </div>

                    <span className="mt-3 block text-sm text-muted">
                      Ajouter le premier ingrédient
                    </span>
                  </button>
                ) : (
                  <div className="mt-6 space-y-2">
                    {ingredients.map((ingredient, index) => {
                      const rowErrors =
                        errors.ingredientRows[ingredient.id] || {};

                      return (
                        <div
                          key={ingredient.id}
                          className="grid gap-2 rounded-2xl border border-white/6 bg-surface-dark p-3 sm:grid-cols-[28px_minmax(180px,1fr)_100px_120px_38px] sm:items-start"
                        >
                          {/* INDEX */}

                          <div className="hidden h-11 items-center justify-center text-[11px] text-subtle sm:flex">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          {/* INGREDIENT */}

                          <div className="relative min-w-0">
                            <select
                              value={ingredient.ingredientId}
                              onChange={(event) =>
                                handleIngredientChange(
                                  ingredient.id,
                                  event.target.value,
                                )
                              }
                              className={`w-full appearance-none rounded-xl border bg-surface px-3 py-3 pr-10 text-sm text-app-text outline-none transition-colors ${
                                rowErrors.ingredient
                                  ? "border-red-500/60"
                                  : "border-white/8 hover:border-white/15 focus:border-accent/50"
                              }`}
                            >
                              <option value="">Choisir un ingrédient</option>

                              {availableIngredients.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>

                            <div className="pointer-events-none absolute right-3 top-3.5 text-subtle">
                              <ChevronDown size={15} strokeWidth={1.7} />
                            </div>

                            {rowErrors.ingredient && (
                              <p className="mt-1.5 text-xs text-red-400">
                                {rowErrors.ingredient}
                              </p>
                            )}
                          </div>

                          {/* QUANTITY */}

                          <div>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              inputMode="decimal"
                              placeholder="Qté"
                              value={ingredient.quantity}
                              onChange={(event) =>
                                handleQuantityChange(
                                  ingredient.id,
                                  event.target.value,
                                )
                              }
                              className={`w-full rounded-xl border bg-surface px-3 py-3 text-sm text-app-text outline-none transition-colors placeholder:text-subtle ${
                                rowErrors.quantity
                                  ? "border-red-500/60"
                                  : "border-white/8 hover:border-white/15 focus:border-accent/50"
                              }`}
                            />

                            {rowErrors.quantity && (
                              <p className="mt-1.5 text-xs text-red-400">
                                {rowErrors.quantity}
                              </p>
                            )}
                          </div>

                          {/* UNIT */}

                          <div className="relative">
                            <select
                              value={ingredient.unit}
                              onChange={(event) =>
                                updateIngredient(ingredient.id, {
                                  unit: event.target.value,
                                })
                              }
                              className="w-full appearance-none rounded-xl border border-white/8 bg-surface px-3 py-3 pr-8 text-sm text-app-text outline-none transition-colors hover:border-white/15 focus:border-accent/50"
                            >
                              {units.map((unitItem) => (
                                <option key={unitItem} value={unitItem}>
                                  {pluralizeUnit(unitItem, ingredient.quantity)}
                                </option>
                              ))}
                            </select>

                            <div className="pointer-events-none absolute right-2.5 top-3.5 text-subtle">
                              <ChevronDown size={14} strokeWidth={1.7} />
                            </div>
                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() => removeIngredient(ingredient.id)}
                            className="flex h-11 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-red-500/10 hover:text-red-400"
                            aria-label="Supprimer l'ingrédient"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* INSTRUCTIONS */}

              <section className="rounded-3xl border border-white/7 bg-surface p-6 sm:p-7">
                <p className="text-xs tracking-[0.18em] text-peach uppercase">
                  Préparation
                </p>

                <h2
                  className="mt-1 text-2xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Comment la préparer
                </h2>

                <p className="mt-2 text-sm text-muted">
                  Facultatif — garde ici les étapes importantes de la recette.
                </p>

                <textarea
                  rows="5"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="Écris les étapes de préparation..."
                  className="mt-5 w-full resize-none rounded-2xl border border-white/7 bg-surface-dark px-4 py-4 text-sm leading-7 text-app-text outline-none transition-colors placeholder:text-subtle hover:border-white/12 focus:border-accent/50"
                />
              </section>
            </div>

            {/* DASHBOARD */}

            <aside className="grid gap-4 sm:grid-cols-3 min-[2200px]:block min-[2200px]:space-y-4">
              {/* PORTIONS */}

              <section
                className={`rounded-3xl border bg-surface p-5 2xl:p-6 ${
                  errors.portions ? "border-red-500/40" : "border-white/7"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                  <Utensils size={18} />
                </div>

                <p className="mt-5 text-xs tracking-[0.16em] text-peach uppercase">
                  Portions
                </p>

                <h2
                  className="mt-1 text-xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Pour combien ?
                </h2>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/7 bg-surface-dark p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPortions((current) =>
                        Math.max(1, Number(current) - 1),
                      );

                      if (errors.portions) {
                        setErrors((current) => ({
                          ...current,
                          portions: "",
                        }));
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-muted transition-colors hover:bg-white/5 hover:text-app-text"
                  >
                    −
                  </button>

                  <div className="text-center">
                    <span
                      className="text-3xl text-peach-light"
                      style={{
                        fontFamily: "var(--font-playfair)",
                      }}
                    >
                      {portions}
                    </span>

                    <p className="mt-0.5 text-[10px] text-subtle">
                      {Number(portions) > 1 ? "portions" : "portion"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPortions((current) => Number(current) + 1);

                      if (errors.portions) {
                        setErrors((current) => ({
                          ...current,
                          portions: "",
                        }));
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-peach/20 bg-peach/8 text-lg text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                  >
                    +
                  </button>
                </div>

                {errors.portions && (
                  <p className="mt-3 text-xs text-red-400">{errors.portions}</p>
                )}
              </section>

              {/* PREVIEW */}

              <section className="rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <p className="text-xs tracking-[0.16em] text-subtle uppercase">
                  Aperçu
                </p>

                <h2
                  className="mt-1 text-xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  En un coup d’œil
                </h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted">Nom</span>

                    <span className="max-w-40 truncate text-right text-app-text">
                      {name || "—"}
                    </span>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted">Portions</span>

                    <span className="text-app-text">{portions}</span>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted">Ingrédients</span>

                    <span className="text-app-text">{ingredients.length}</span>
                  </div>
                </div>
              </section>

              {/* SAVE */}

              <section className="rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                  <Save size={18} />
                </div>

                <h2
                  className="mt-5 text-xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Tout est prêt ?
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Enregistre la recette pour la retrouver dans ton carnet et ton
                  planning.
                </p>

                <button
                  type="submit"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-peach/25 bg-peach/10 px-4 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/40 hover:bg-peach/15"
                >
                  <Save size={16} />
                  Enregistrer
                </button>
              </section>
            </aside>
          </form>
        </div>
      </div>

      <MobileNav active="recipes" />
    </main>
  );
}
