"use client";

import AddIngredientModal from "@/components/AddIngredientModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";

import { defaultIngredients } from "@/data/defaultIngredients";
import { units } from "@/data/units";

import { ChevronDown, Plus, Search, Trash2, Wheat } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);

  const [name, setName] = useState("");

  const [unit, setUnit] = useState("g");

  const [search, setSearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const storedIngredients = localStorage.getItem("ingredients");

    const currentIngredients = storedIngredients
      ? JSON.parse(storedIngredients)
      : [];

    const customIngredients = currentIngredients.filter(
      (ingredient) => ingredient.custom,
    );

    const mergedIngredients = [
      ...defaultIngredients,

      ...customIngredients.filter(
        (customIngredient) =>
          !defaultIngredients.some(
            (defaultIngredient) =>
              defaultIngredient.name.toLowerCase() ===
              customIngredient.name.toLowerCase(),
          ),
      ),
    ];

    setIngredients(mergedIngredients);

    localStorage.setItem("ingredients", JSON.stringify(mergedIngredients));
  }, []);

  function saveIngredients(updatedIngredients) {
    setIngredients(updatedIngredients);

    localStorage.setItem("ingredients", JSON.stringify(updatedIngredients));
  }

  function addIngredient(event) {
    if (event) {
      event.preventDefault();
    }

    const cleanName = name.trim();

    if (!cleanName) return false;

    const alreadyExists = ingredients.some(
      (ingredient) => ingredient.name.toLowerCase() === cleanName.toLowerCase(),
    );

    if (alreadyExists) return false;

    const newIngredient = {
      id: crypto.randomUUID(),
      name: cleanName,
      unit,
      custom: true,
    };

    saveIngredients([...ingredients, newIngredient]);

    setName("");
    setUnit("g");

    return true;
  }

  function removeIngredient(id) {
    const confirmed = window.confirm("Supprimer cet ingrédient ?");

    if (!confirmed) return;

    const updatedIngredients = ingredients.filter(
      (ingredient) => ingredient.id !== id,
    );

    saveIngredients(updatedIngredients);
  }

  const filteredIngredients = useMemo(() => {
    return ingredients
      .filter((ingredient) =>
        ingredient.name.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, "fr", {
          sensitivity: "base",
        }),
      );
  }, [ingredients, search]);

  const customIngredientsCount = useMemo(() => {
    return ingredients.filter((ingredient) => ingredient.custom).length;
  }, [ingredients]);

  const defaultIngredientsCount = ingredients.length - customIngredientsCount;

  return (
    <main className="min-h-screen bg-surface-dark text-app-text">
      <div className="flex min-h-screen w-full">
        <Sidebar active="ingredients" />

        <div className="min-w-0 flex-1 px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-14">
          {/* HEADER */}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full">
              <p className="text-xs tracking-[0.18em] text-accent uppercase">
                Base personnelle
              </p>

              <h1
                className="mt-2 text-4xl sm:text-5xl"
                style={{
                  fontFamily: "var(--font-playfair)",
                }}
              >
                Ingrédients
              </h1>

              <div className="mt-4 h-px w-1/2 bg-linear-to-r from-peach/80 via-peach/35 to-transparent" />

              <p className="mt-3 text-sm leading-6 text-muted">
                Garde ici les ingrédients que tu utilises souvent. Ils seront
                disponibles directement dans tes recettes.
              </p>
            </div>
          </div>

          {/* DASHBOARD */}

          <div className="mt-8 grid gap-6 min-[2200px]:grid-cols-[minmax(0,1fr)_300px]">
            {/* LEFT */}

            <div className="min-w-0">
              {/* SEARCH */}

              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
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
                    placeholder="Rechercher un ingrédient..."
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
                    <Wheat size={18} />
                  </div>

                  <div>
                    <p
                      className="text-2xl text-peach-light"
                      style={{
                        fontFamily: "var(--font-playfair)",
                      }}
                    >
                      {ingredients.length}
                    </p>

                    <p className="text-[11px] text-subtle">
                      {ingredients.length > 1 ? "ingrédients" : "ingrédient"}
                    </p>
                  </div>
                </div>
              </section>

              {/* COLLECTION */}

              <section className="mt-8">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.18em] text-peach uppercase">
                      Ta base
                    </p>

                    <h2
                      className="mt-1 text-2xl"
                      style={{
                        fontFamily: "var(--font-playfair)",
                      }}
                    >
                      Tous les ingrédients
                    </h2>
                  </div>

                  {search && filteredIngredients.length > 0 && (
                    <p className="text-xs text-subtle">
                      {filteredIngredients.length} résultat
                      {filteredIngredients.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {filteredIngredients.length === 0 ? (
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
                      Aucun ingrédient trouvé
                    </h3>

                    <p className="mt-2 text-sm text-muted">
                      Même le frigo a l’air perplexe.
                    </p>

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-5 text-sm text-peach transition-colors hover:text-peach-light"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="group grid grid-cols-[minmax(0,1fr)_auto_32px] items-center gap-2 border-b border-white/5 px-1 py-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                ingredient.custom ? "bg-peach" : "bg-accent"
                              }`}
                            />

                            <p className="truncate text-sm font-medium text-app-text">
                              {ingredient.name}
                            </p>
                          </div>

                          <p className="mt-0.5 pl-3.5 text-[10px] text-subtle">
                            {ingredient.custom ? "Personnel" : "Par défaut"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-md bg-surface px-2 py-1 text-[11px] text-peach-light">
                          {ingredient.unit}
                        </span>

                        <div className="flex h-8 w-8 items-center justify-center">
                          {ingredient.custom && (
                            <button
                              type="button"
                              onClick={() => removeIngredient(ingredient.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle opacity-60 transition-colors hover:bg-red-500/10 hover:text-red-400 hover:opacity-100"
                              aria-label={`Supprimer ${ingredient.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT */}

            <aside className="space-y-4 min-[2200px]:sticky min-[2200px]:top-8 min-[2200px]:self-start">
              {/* ADD CARD */}

              <form
                onSubmit={addIngredient}
                className="relative overflow-hidden rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-peach/5 blur-3xl" />

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                    <Plus size={18} />
                  </div>

                  <p className="mt-5 text-xs tracking-[0.16em] text-peach uppercase">
                    Nouveau
                  </p>

                  <h2
                    className="mt-1 text-xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Ajouter un ingrédient
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    Ajoute un produit à ta base avec son unité utilisée par
                    défaut.
                  </p>

                  <div className="mt-5">
                    <label
                      htmlFor="ingredient-name"
                      className="text-[10px] tracking-[0.14em] text-subtle uppercase"
                    >
                      Nom
                    </label>

                    <input
                      id="ingredient-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ex : Mozzarella"
                      className="mt-2 w-full rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 text-sm text-app-text outline-none transition placeholder:text-subtle hover:border-white/15 focus:border-accent/50"
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="ingredient-unit"
                      className="text-[10px] tracking-[0.14em] text-subtle uppercase"
                    >
                      Unité par défaut
                    </label>

                    <div className="relative mt-2">
                      <select
                        id="ingredient-unit"
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 pr-11 text-sm text-app-text outline-none transition hover:border-white/15 focus:border-accent/50"
                      >
                        {units.map((unitItem) => (
                          <option key={unitItem} value={unitItem}>
                            {unitItem}
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-subtle">
                        <ChevronDown size={16} strokeWidth={1.7} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-peach/20 bg-peach/8 px-4 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                  >
                    <Plus size={16} />
                    Ajouter l’ingrédient
                  </button>
                </div>
              </form>

              {/* STATS */}

              <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <div className="pointer-events-none absolute -bottom-14 -right-14 h-36 w-36 rounded-full bg-accent/5 blur-3xl" />

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                    <Wheat size={18} />
                  </div>

                  <p className="mt-5 text-xs tracking-[0.16em] text-subtle uppercase">
                    Base
                  </p>

                  <h2
                    className="mt-1 text-xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Ton répertoire
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/6 bg-surface-dark px-3 py-3">
                      <p
                        className="text-2xl text-peach-light"
                        style={{
                          fontFamily: "var(--font-playfair)",
                        }}
                      >
                        {defaultIngredientsCount}
                      </p>

                      <p className="mt-1 text-[10px] text-subtle">par défaut</p>
                    </div>

                    <div className="rounded-xl border border-white/6 bg-surface-dark px-3 py-3">
                      <p
                        className="text-2xl text-accent-light"
                        style={{
                          fontFamily: "var(--font-playfair)",
                        }}
                      >
                        {customIngredientsCount}
                      </p>

                      <p className="mt-1 text-[10px] text-subtle">personnels</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] leading-5 text-subtle">
                    Les ingrédients personnels peuvent être supprimés à tout
                    moment.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {/* INTERMEDIATE DESKTOP FAB */}

      <button
        type="button"
        onClick={() => setAddModalOpen(true)}
        className="fixed bottom-8 right-5 z-40 hidden h-14 w-14 items-center justify-center rounded-2xl border border-peach/25 bg-surface text-peach-light shadow-[0_10px_35px_rgba(0,0,0,0.45)] transition-colors hover:border-peach/40 hover:bg-surface-light lg:flex min-[2200px]:hidden"
        aria-label="Ajouter un ingrédient"
      >
        <Plus size={21} />
      </button>

      {/* MODAL */}

      <AddIngredientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        name={name}
        setName={setName}
        unit={unit}
        setUnit={setUnit}
        units={units}
        onAdd={addIngredient}
      />

      {/* MOBILE NAV */}

      <MobileNav
        active="ingredients"
        onAddIngredient={() => setAddModalOpen(true)}
      />
    </main>
  );
}
