"use client";

import { ChevronDown, X } from "lucide-react";

export default function MealModal({
  open,
  recipes,
  mode,
  setMode,
  selectedRecipeId,
  setSelectedRecipeId,
  selectedServings,
  setSelectedServings,
  customLabel,
  setCustomLabel,
  onClose,
  onSave,
}) {
  if (!open) return null;

  const selectedRecipe = recipes.find(
    (recipe) => String(recipe.id) === String(selectedRecipeId),
  );

  function switchToRecipe() {
    setMode("recipe");
    setCustomLabel("");
  }

  function switchToText() {
    setMode("text");
    setSelectedRecipeId("");
    setSelectedServings(1);
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      {/* BACKDROP */}

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        aria-label="Fermer"
      />

      {/* MODAL */}

      <div className="relative z-10 w-full max-w-130 overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-[0_35px_120px_rgba(0,0,0,0.8)]">
        {/* HEADER */}

        <div className="relative px-7 pb-5 pt-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-subtle transition-colors hover:border-white/8 hover:bg-white/5 hover:text-app-text"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

          <p className="text-[11px] font-medium tracking-[0.18em] text-peach uppercase">
            Repas
          </p>

          <h2
            className="mt-2 pr-12 text-3xl sm:text-[34px]"
            style={{
              fontFamily: "var(--font-playfair)",
            }}
          >
            Que mange-t-on ?
          </h2>

          <div className="mt-5 h-px w-50 bg-linear-to-r from-peach/70 to-transparent" />
        </div>

        {/* BODY */}

        <div className="px-7 pb-7">
          {/* MODE */}

          <div className="grid grid-cols-2 rounded-xl border border-white/7 bg-surface-dark p-1">
            <button
              type="button"
              onClick={switchToRecipe}
              className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                mode === "recipe"
                  ? "bg-accent/85 text-white"
                  : "text-muted hover:bg-white/3 hover:text-app-text"
              }`}
            >
              Une recette
            </button>

            <button
              type="button"
              onClick={switchToText}
              className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                mode === "text"
                  ? "bg-accent/85 text-white"
                  : "text-muted hover:bg-white/3 hover:text-app-text"
              }`}
            >
              Autre
            </button>
          </div>

          {/* RECIPE */}

          {mode === "recipe" ? (
            <div className="mt-7">
              <label className="text-[10px] tracking-[0.15em] text-subtle uppercase">
                Choisis une recette
              </label>

              {recipes.length > 0 ? (
                <>
                  <div className="relative mt-2">
                    <select
                      value={selectedRecipeId}
                      onChange={(event) => {
                        setSelectedRecipeId(event.target.value);

                        setSelectedServings(1);
                      }}
                      className="w-full appearance-none rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 pr-11 text-sm text-app-text outline-none transition-colors hover:border-white/15 focus:border-accent/40"
                    >
                      <option value="">Choisir une recette</option>

                      {recipes
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name, "fr"))
                        .map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </option>
                        ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-subtle">
                      <ChevronDown size={16} strokeWidth={1.7} />
                    </div>
                  </div>

                  {/* PORTIONS */}

                  {selectedRecipe && (
                    <div className="mt-5 rounded-2xl border border-white/7 bg-surface-dark p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] tracking-[0.15em] text-peach uppercase">
                            Portions
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted">
                            Combien de portions seront mangées à ce repas ?
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] text-subtle">
                            Recette de base
                          </p>

                          <p className="mt-0.5 text-xs text-muted">
                            {selectedRecipe.baseServings}{" "}
                            {Number(selectedRecipe.baseServings) > 1
                              ? "portions"
                              : "portion"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/7 bg-background/40 p-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedServings((current) =>
                              Math.max(1, Number(current) - 1),
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-muted transition-colors hover:bg-white/5 hover:text-app-text"
                          aria-label="Retirer une portion"
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
                            {Number(selectedServings) > 1
                              ? "portions"
                              : "portion"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedServings(
                              (current) => Number(current) + 1,
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-peach/20 bg-peach/8 text-xl text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                          aria-label="Ajouter une portion"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
                  <p className="text-sm text-muted">
                    Tu n’as encore aucune recette.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* FREE TEXT */

            <div className="mt-7">
              <label
                htmlFor="customLabel"
                className="text-[10px] tracking-[0.15em] text-subtle uppercase"
              >
                Repas libre
              </label>

              <input
                id="customLabel"
                type="text"
                value={customLabel}
                onChange={(event) => setCustomLabel(event.target.value)}
                placeholder="Ex : Restes, tacos, resto..."
                className="mt-2 w-full rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 text-sm text-app-text outline-none transition-colors placeholder:text-subtle hover:border-white/15 focus:border-accent/40"
                autoFocus
              />
            </div>
          )}

          {/* ACTIONS */}

          <div className="mt-8 flex items-center justify-end gap-5">
            <button
              type="button"
              onClick={onClose}
              className="px-1 py-2 text-sm text-subtle transition-colors hover:text-app-text"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={onSave}
              className="rounded-xl border border-peach/25 bg-peach/8 px-5 py-2.5 text-sm font-medium text-peach-light transition-colors hover:border-peach/40 hover:bg-peach/12"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
