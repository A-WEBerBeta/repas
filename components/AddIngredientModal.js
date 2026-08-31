"use client";

import { ChevronDown, Plus, X } from "lucide-react";

export default function AddIngredientModal({
  open,
  onClose,
  name,
  setName,
  unit,
  setUnit,
  units,
  onAdd,
}) {
  if (!open) return null;

  function handleSubmit(event) {
    event.preventDefault();

    const added = onAdd();

    if (added !== false) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      {/* BACKDROP */}

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Fermer"
      />

      {/* MODAL */}

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-surface p-6 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-white/4 hover:text-app-text"
          aria-label="Fermer"
        >
          <X size={17} />
        </button>

        <p className="text-xs tracking-[0.18em] text-peach uppercase">
          Nouvel ingrédient
        </p>

        <h2
          className="mt-1 text-2xl"
          style={{
            fontFamily: "var(--font-playfair)",
          }}
        >
          Ajouter à ta base
        </h2>

        <div className="mt-4 h-px w-24 bg-linear-to-r from-peach/70 to-transparent" />

        {/* NAME */}

        <div className="mt-6">
          <label
            htmlFor="modal-ingredient-name"
            className="text-[10px] tracking-[0.14em] text-subtle uppercase"
          >
            Nom
          </label>

          <input
            id="modal-ingredient-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex : Mozzarella"
            autoFocus
            className="mt-2 w-full rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 text-sm text-app-text outline-none transition-colors placeholder:text-subtle hover:border-white/15 focus:border-accent/50"
          />
        </div>

        {/* UNIT */}

        <div className="mt-4">
          <label
            htmlFor="modal-ingredient-unit"
            className="text-[10px] tracking-[0.14em] text-subtle uppercase"
          >
            Unité par défaut
          </label>

          <div className="relative mt-2">
            <select
              id="modal-ingredient-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="w-full appearance-none rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 pr-11 text-sm text-app-text outline-none transition-colors hover:border-white/15 focus:border-accent/50"
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

        {/* ACTIONS */}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:text-app-text"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-peach/25 bg-peach/10 px-5 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/40 hover:bg-peach/15"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}
