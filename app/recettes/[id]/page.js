"use client";

import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";

import { formatQuantityUnit } from "@/utils/formatUnit";

import {
  ArrowLeft,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Utensils,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();

  const { showToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);

  const [selectedServings, setSelectedServings] = useState(1);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const storedRecipes = localStorage.getItem("recipes");
    const storedIngredients = localStorage.getItem("ingredients");

    const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];

    const ingredientList = storedIngredients
      ? JSON.parse(storedIngredients)
      : [];

    const foundRecipe = recipes.find(
      (item) => String(item.id) === String(params.id),
    );

    if (!foundRecipe) {
      router.push("/recettes");
      return;
    }

    setRecipe(foundRecipe);
    setIngredients(ingredientList);
    setSelectedServings(foundRecipe.baseServings);
  }, [params.id, router]);

  function getIngredientName(ingredientId) {
    return (
      ingredients.find(
        (ingredient) => String(ingredient.id) === String(ingredientId),
      )?.name || "Ingrédient inconnu"
    );
  }

  function getAdjustedQuantity(quantity) {
    if (!recipe) return quantity;

    const adjusted =
      (Number(quantity) * Number(selectedServings)) /
      Number(recipe.baseServings);

    return Number.isInteger(adjusted) ? adjusted : Number(adjusted.toFixed(2));
  }

  function deleteRecipe() {
    if (!recipe) return;

    const storedRecipes = localStorage.getItem("recipes");

    const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];

    const updatedRecipes = recipes.filter(
      (item) => String(item.id) !== String(recipe.id),
    );

    localStorage.setItem("recipes", JSON.stringify(updatedRecipes));

    showToast("Recette supprimée");

    router.push("/recettes");
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-surface-dark text-app-text">
        <div className="flex min-h-screen w-full">
          <Sidebar active="recipes" />

          <div className="flex flex-1 items-center justify-center text-sm text-subtle">
            Chargement...
          </div>
        </div>

        <MobileNav active="recipes" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-dark text-app-text">
      <div className="flex min-h-screen w-full">
        <Sidebar active="recipes" />

        <div className="min-w-0 flex-1 px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-14">
          {/* TOP */}

          <div className="flex items-center justify-between gap-4">
            <Link
              href="/recettes"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/8 px-4 py-3 text-sm text-muted transition-colors hover:border-white/15 hover:bg-white/3hover:text-app-text"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Retour aux recettes
            </Link>

            {/* ACTIONS */}

            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  menuOpen
                    ? "border-accent/25 bg-accent/10 text-accent-light"
                    : "border-white/8 bg-surface text-muted hover:border-white/15 hover:text-app-text"
                }`}
                aria-label="Actions de la recette"
              >
                <MoreHorizontal size={19} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-13 z-50 w-52 overflow-hidden rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                  <div className="px-3 pb-2 pt-1">
                    <p className="truncate text-xs font-medium text-app-text">
                      {recipe.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-subtle">
                      Actions rapides
                    </p>
                  </div>

                  <div className="my-1 h-px bg-white/6" />

                  <Link
                    href={`/recettes/${recipe.id}/modifier`}
                    onClick={() => setMenuOpen(false)}
                    className="group/menu flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/4 hover:text-app-text"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4 text-subtle transition-colors group-hover/menu:bg-accent/10 group-hover/menu:text-accent-light">
                      <Pencil size={15} />
                    </div>

                    <div>
                      <p className="font-medium">Modifier</p>

                      <p className="text-[11px] text-subtle">
                        Éditer la recette
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="group/menu mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-red-500/8 hover:text-red-300"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4 text-subtle transition-colors group-hover/menu:bg-red-500/10 group-hover/menu:text-red-400">
                      <Trash2 size={15} />
                    </div>

                    <div>
                      <p className="font-medium">Supprimer</p>

                      <p className="text-[11px] text-subtle">
                        Supprimer définitivement
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RECIPE HEADER */}

          <section className="mt-6 grid overflow-hidden rounded-3xl border border-white/7 bg-surface lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* IMAGE */}

            <div className="relative min-h-70 overflow-hidden bg-surface-dark sm:min-h-85 lg:min-h-97.5">
              {recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full min-h-70 items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/8 text-peach/30">
                    <BookOpen size={28} strokeWidth={1.4} />
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-transparent to-surface/25 lg:block" />
            </div>

            {/* INFO */}

            <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-xs tracking-[0.18em] text-peach uppercase">
                Recette
              </p>

              <h1
                className="mt-2 text-4xl leading-tight sm:text-5xl xl:text-6xl"
                style={{
                  fontFamily: "var(--font-playfair)",
                }}
              >
                {recipe.name}
              </h1>

              <div className="mt-5 h-px w-1/2 bg-linear-to-r from-peach/70 via-peach/25 to-transparent" />

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/7 bg-surface-dark px-3 py-2">
                  <Utensils size={15} className="text-accent-light" />

                  <span className="text-sm text-muted">
                    {recipe.baseServings}{" "}
                    {Number(recipe.baseServings) > 1 ? "portions" : "portion"}
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/7 bg-surface-dark px-3 py-2">
                  <BookOpen size={15} className="text-peach" />

                  <span className="text-sm text-muted">
                    {recipe.ingredients.length}{" "}
                    {recipe.ingredients.length > 1
                      ? "ingrédients"
                      : "ingrédient"}
                  </span>
                </div>
              </div>

              <p className="mt-7 max-w-xl text-sm leading-6 text-muted">
                Ajuste le nombre de portions et les quantités seront recalculées
                automatiquement.
              </p>
            </div>
          </section>

          {/* CONTENT */}

          <div className="mt-6 grid gap-6 min-[2200px]:grid-cols-[minmax(0,1fr)_300px]">
            {/* LEFT */}

            <div className="min-w-0">
              {/* PREPARATION */}

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

                {recipe.instructions ? (
                  <div className="mt-6 whitespace-pre-line text-sm leading-7 text-muted sm:text-[15px]">
                    {recipe.instructions}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/8 bg-white/1 px-5 py-8 text-center">
                    <p className="text-sm text-subtle">
                      Aucune instruction enregistrée.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT / BOTTOM DASHBOARD */}

            <aside className="grid gap-4 sm:grid-cols-2 min-[2200px]:block min-[2200px]:space-y-4">
              {/* PORTIONS */}

              <section className="rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
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
                    onClick={() =>
                      setSelectedServings((current) =>
                        Math.max(1, Number(current) - 1),
                      )
                    }
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
                      {selectedServings}
                    </span>

                    <p className="mt-0.5 text-[10px] text-subtle">
                      {Number(selectedServings) > 1 ? "portions" : "portion"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedServings((current) => Number(current) + 1)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-peach/20 bg-peach/8 text-lg text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                  >
                    +
                  </button>
                </div>

                {Number(selectedServings) !== Number(recipe.baseServings) && (
                  <p className="mt-3 text-[11px] text-subtle">
                    Recette prévue pour {recipe.baseServings}{" "}
                    {Number(recipe.baseServings) > 1 ? "portions" : "portion"}
                  </p>
                )}
              </section>

              {/* INGREDIENTS */}

              <section className="rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.16em] text-peach uppercase">
                      Ingrédients
                    </p>

                    <h2
                      className="mt-1 text-xl"
                      style={{
                        fontFamily: "var(--font-playfair)",
                      }}
                    >
                      Ce qu’il te faut
                    </h2>
                  </div>

                  <span className="rounded-lg bg-accent/8 px-2.5 py-1 text-[11px] text-accent-light">
                    {recipe.ingredients.length}
                  </span>
                </div>

                <div className="mt-5 divide-y divide-white/5">
                  {recipe.ingredients.map((ingredient, index) => {
                    const adjustedQuantity = getAdjustedQuantity(
                      ingredient.quantity,
                    );

                    return (
                      <div
                        key={`${ingredient.ingredientId}-${index}`}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0 truncate text-sm text-app-text">
                          {getIngredientName(ingredient.ingredientId)}
                        </span>

                        <span className="shrink-0 text-sm font-medium text-peach-light">
                          {formatQuantityUnit(
                            adjustedQuantity,
                            ingredient.unit,
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <MobileNav active="recipes" />

      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Supprimer cette recette ?"
        description={`"${recipe.name}" sera supprimée définitivement. Cette action ne pourra pas être annulée.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={deleteRecipe}
      />
    </main>
  );
}
