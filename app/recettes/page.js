"use client";

import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";

import { loadUserState, saveUserState } from "@/lib/userState";

import {
  ArrowRight,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [search, setSearch] = useState("");
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const menuRef = useRef(null);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const data = await loadUserState();

        setRecipes(data.recipes);

        /*
         * Copie locale temporaire.
         * On la garde tant que toute l'app
         * n'est pas encore migrée.
         */
        localStorage.setItem("recipes", JSON.stringify(data.recipes));
      } catch (error) {
        console.error("Erreur chargement recettes :", error);

        showToast("Impossible de charger les recettes", "info");
      }
    }

    loadRecipes();
  }, [showToast]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function deleteRecipe() {
    if (!recipeToDelete || isDeleting) {
      return;
    }

    const updatedRecipes = recipes.filter(
      (recipe) => recipe.id !== recipeToDelete.id,
    );

    setIsDeleting(true);

    /*
     * Mise à jour immédiate dans l'interface.
     */
    setRecipes(updatedRecipes);

    /*
     * Copie locale temporaire.
     */
    localStorage.setItem("recipes", JSON.stringify(updatedRecipes));

    try {
      await saveUserState({
        recipes: updatedRecipes,
      });

      setRecipeToDelete(null);
      setOpenMenuId(null);

      showToast("Recette supprimée");
    } catch (error) {
      console.error("Erreur suppression recette :", error);

      /*
       * Si Supabase échoue, on remet la liste
       * telle qu'elle était avant.
       */
      setRecipes(recipes);

      localStorage.setItem("recipes", JSON.stringify(recipes));

      showToast("La recette n’a pas pu être supprimée", "info");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase()),
  );

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
                Mes recettes
              </h1>

              <div className="mt-4 h-px w-1/2 bg-linear-to-r from-peach/80 via-peach/35 to-transparent" />

              <p className="mt-3 text-sm leading-6 text-muted">
                Retrouve toutes tes recettes, adapte-les et organise ton carnet.
              </p>
            </div>

            <Link
              href="/recettes/nouvelle"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-peach/20 bg-peach/8 px-4 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
            >
              <Plus size={17} />
              Nouvelle recette
            </Link>
          </div>

          {/* TOP BAR */}

          <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            {/* SEARCH */}

            <div className="flex items-center rounded-3xl border border-white/7 bg-surface px-5 py-2">
              <Search
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-subtle"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une recette..."
                className="w-full bg-transparent px-4 py-3 text-sm text-app-text outline-none placeholder:text-subtle"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs text-subtle transition-colors hover:bg-white/4 hover:text-app-text"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* COUNT */}

            <div className="flex items-center gap-4 rounded-3xl border border-white/7 bg-surface px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                <BookOpen size={18} />
              </div>

              <div>
                <p
                  className="text-2xl text-peach-light"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  {recipes.length}
                </p>

                <p className="text-[11px] text-subtle">
                  {recipes.length > 1 ? "recettes" : "recette"}
                </p>
              </div>
            </div>
          </section>

          {/* COLLECTION */}

          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.18em] text-peach uppercase">
                  Collection
                </p>

                <h2
                  className="mt-1 text-2xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Toutes les recettes
                </h2>
              </div>

              {search && filteredRecipes.length > 0 && (
                <p className="text-xs text-subtle">
                  {filteredRecipes.length} résultat
                  {filteredRecipes.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* EMPTY */}

            {recipes.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-surface p-10 sm:p-14">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-peach/5 blur-3xl" />

                <div className="relative max-w-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-peach-light">
                    <BookOpen size={21} />
                  </div>

                  <p className="mt-6 text-xs tracking-[0.16em] text-peach uppercase">
                    Ton carnet est vide
                  </p>

                  <h3
                    className="mt-2 text-3xl sm:text-4xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Il est temps d’ajouter ta première recette.
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-6 text-muted">
                    Garde tes recettes préférées, leurs ingrédients et leurs
                    proportions toujours à portée de main.
                  </p>

                  <Link
                    href="/recettes/nouvelle"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl border border-peach/20 bg-peach/8 px-5 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                  >
                    Créer une recette
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              /* NO RESULT */

              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-surface px-6 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/8 text-accent-light">
                  <Search size={20} />
                </div>

                <h3
                  className="mt-4 text-xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Aucune recette trouvée
                </h3>

                <p className="mt-2 text-sm text-muted">
                  Essaie avec un autre nom.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 text-sm text-peach transition-colors hover:text-peach-light"
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              /* GRID */

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[2100px]:grid-cols-5">
                {filteredRecipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="group relative overflow-hidden rounded-3xl border border-white/7 bg-surface transition-[border-color,box-shadow,background-color] duration-300 hover:border-accent/25 hover:bg-surface-light hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
                  >
                    <Link
                      href={`/recettes/${recipe.id}`}
                      className="block h-full"
                    >
                      {/* IMAGE */}

                      <div className="relative isolate flex aspect-16/10 items-center justify-center overflow-hidden bg-surface-dark">
                        {recipe.image ? (
                          <Image
                            src={recipe.image}
                            alt={recipe.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                          />
                        ) : (
                          <>
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,150,147,0.12),transparent_60%)]" />

                            <BookOpen
                              size={34}
                              strokeWidth={1.3}
                              className="relative text-peach/25"
                            />
                          </>
                        )}

                        <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">
                        <h3
                          className="line-clamp-2 text-xl transition-colors group-hover:text-peach-light"
                          style={{
                            fontFamily: "var(--font-playfair)",
                          }}
                        >
                          {recipe.name}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
                          <span>
                            {recipe.baseServings}{" "}
                            {Number(recipe.baseServings) > 1
                              ? "portions"
                              : "portion"}
                          </span>

                          <span className="text-border">•</span>

                          <span>
                            {recipe.ingredients?.length || 0}{" "}
                            {(recipe.ingredients?.length || 0) > 1
                              ? "ingrédients"
                              : "ingrédient"}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-accent-light">
                          Voir la recette
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </Link>

                    {/* MENU */}

                    <div
                      ref={openMenuId === recipe.id ? menuRef : null}
                      className="absolute right-4 top-4 z-20"
                    >
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          setOpenMenuId((current) =>
                            current === recipe.id ? null : recipe.id,
                          );
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition ${
                          openMenuId === recipe.id
                            ? "border-accent/30 bg-accent/15 text-accent-light"
                            : "border-white/10 bg-black/45 text-muted hover:border-white/20 hover:bg-black/65 hover:text-app-text"
                        }`}
                        aria-label={`Actions pour ${recipe.name}`}
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {openMenuId === recipe.id && (
                        <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
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
                            onClick={() => setOpenMenuId(null)}
                            className="group/menu flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-white/4 hover:text-app-text"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4 text-subtle transition group-hover/menu:bg-accent/10 group-hover/menu:text-accent-light">
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
                              setRecipeToDelete(recipe);

                              setOpenMenuId(null);
                            }}
                            className="group/menu mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted transition hover:bg-red-500/8 hover:text-red-300"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4 text-subtle transition group-hover/menu:bg-red-500/10 group-hover/menu:text-red-400">
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
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <MobileNav active="recipes" />

      <DeleteConfirmModal
        open={Boolean(recipeToDelete)}
        title="Supprimer cette recette ?"
        description={
          recipeToDelete
            ? `"${recipeToDelete.name}" sera supprimée définitivement. Cette action ne pourra pas être annulée.`
            : ""
        }
        onCancel={() => {
          if (!isDeleting) {
            setRecipeToDelete(null);
          }
        }}
        onConfirm={deleteRecipe}
      />
    </main>
  );
}
