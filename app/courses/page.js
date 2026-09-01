"use client";

import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";

import { defaultIngredients } from "@/data/defaultIngredients";

import { loadUserState, saveUserState } from "@/lib/userState";

import { formatQuantityUnit } from "@/utils/formatUnit";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  Plus,
  ShoppingBasket,
  Trash2,
  Utensils,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

function getMonday(date) {
  const current = new Date(date);

  const day = current.getDay();

  const difference = current.getDate() - day + (day === 0 ? -6 : 1);

  current.setDate(difference);

  current.setHours(0, 0, 0, 0);

  return current;
}

function addDays(date, amount) {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);

  return result;
}

function getWeekKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);

  const mondayDay = monday.getDate();
  const sundayDay = sunday.getDate();

  const mondayMonth = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(monday);

  const sundayMonth = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
  }).format(sunday);

  if (
    monday.getMonth() === sunday.getMonth() &&
    monday.getFullYear() === sunday.getFullYear()
  ) {
    return `${mondayDay} – ${sundayDay} ${sundayMonth}`;
  }

  return `${mondayDay} ${mondayMonth} – ${sundayDay} ${sundayMonth}`;
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function CoursesPage() {
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [planning, setPlanning] = useState({});

  const [shoppingLists, setShoppingLists] = useState({});

  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));

  const [manualItem, setManualItem] = useState("");

  const weekKey = useMemo(() => getWeekKey(currentMonday), [currentMonday]);

  const currentPlanning = useMemo(() => {
    return planning?.[weekKey] || {};
  }, [planning, weekKey]);

  const currentShoppingState = useMemo(() => {
    const current = shoppingLists?.[weekKey];

    return {
      checked: current?.checked || {},
      manualItems: current?.manualItems || [],
    };
  }, [shoppingLists, weekKey]);

  const automaticItems = useMemo(() => {
    const totals = {};

    Object.entries(currentPlanning || {}).forEach(([dayKey, day]) => {
      if (!day) return;

      Object.entries(day).forEach(([mealKey, slot]) => {
        if (!slot || slot.type !== "recipe" || !slot.recipeId) {
          return;
        }

        const recipe = recipes.find(
          (item) => String(item.id) === String(slot.recipeId),
        );

        if (!recipe) {
          console.warn("Recette introuvable :", slot.recipeId, dayKey, mealKey);

          return;
        }

        if (!Array.isArray(recipe.ingredients)) {
          return;
        }

        const baseServings = Math.max(1, Number(recipe.baseServings) || 1);

        const plannedServings = Math.max(1, Number(slot.servings) || 1);

        recipe.ingredients.forEach((recipeIngredient) => {
          const ingredient = ingredients.find(
            (item) => String(item.id) === String(recipeIngredient.ingredientId),
          );

          if (!ingredient) {
            console.warn(
              "Ingrédient introuvable :",
              recipeIngredient.ingredientId,
            );

            return;
          }

          const baseQuantity = Number(recipeIngredient.quantity);

          if (Number.isNaN(baseQuantity) || baseQuantity <= 0) {
            return;
          }

          const quantity = (baseQuantity * plannedServings) / baseServings;

          const unit = recipeIngredient.unit || ingredient.unit || "";

          const itemKey = `${ingredient.id}__${unit}`;

          if (!totals[itemKey]) {
            totals[itemKey] = {
              id: itemKey,
              ingredientId: ingredient.id,
              name: ingredient.name,
              quantity: 0,
              unit,
              type: "automatic",
            };
          }

          totals[itemKey].quantity += quantity;
        });
      });
    });

    return Object.values(totals).sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    );
  }, [currentPlanning, recipes, ingredients]);

  const plannedRecipesCount = useMemo(() => {
    let count = 0;

    Object.values(currentPlanning || {}).forEach((day) => {
      Object.values(day || {}).forEach((slot) => {
        if (slot?.type === "recipe") {
          count += 1;
        }
      });
    });

    return count;
  }, [currentPlanning]);

  const allItems = useMemo(() => {
    const manualItems = currentShoppingState.manualItems.map((item) => ({
      ...item,
      type: "manual",
    }));

    return [...automaticItems, ...manualItems];
  }, [automaticItems, currentShoppingState.manualItems]);

  const checkedCount = useMemo(() => {
    return allItems.filter((item) => currentShoppingState.checked?.[item.id])
      .length;
  }, [allItems, currentShoppingState.checked]);

  const isCurrentWeek = isSameDay(currentMonday, getMonday(new Date()));

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadUserState();

        setRecipes(data.recipes);

        setIngredients(
          data.ingredients?.length > 0 ? data.ingredients : defaultIngredients,
        );

        setPlanning(data.planning);

        setShoppingLists(data.shoppingLists);

        /*
         * Copie temporaire locale pendant
         * la migration du reste de l'app.
         */
        localStorage.setItem("recipes", JSON.stringify(data.recipes));

        localStorage.setItem(
          "ingredients",
          JSON.stringify(
            data.ingredients?.length > 0
              ? data.ingredients
              : defaultIngredients,
          ),
        );

        localStorage.setItem("planning", JSON.stringify(data.planning));

        localStorage.setItem(
          "shoppingLists",
          JSON.stringify(data.shoppingLists),
        );
      } catch (error) {
        console.error("Erreur chargement Courses :", error);

        showToast("Impossible de charger les courses", "info");
      }
    }

    loadData();
  }, [showToast]);

  async function saveShoppingLists(updated) {
    setShoppingLists(updated);

    localStorage.setItem("shoppingLists", JSON.stringify(updated));

    try {
      await saveUserState({
        shoppingLists: updated,
      });
    } catch (error) {
      console.error("Erreur sauvegarde courses :", error);

      showToast("La liste n’a pas pu être synchronisée", "info");
    }
  }

  function toggleItem(itemId) {
    const isChecked = Boolean(currentShoppingState.checked?.[itemId]);

    const updatedWeek = {
      ...currentShoppingState,

      checked: {
        ...currentShoppingState.checked,

        [itemId]: !isChecked,
      },
    };

    const updatedShoppingLists = {
      ...shoppingLists,

      [weekKey]: updatedWeek,
    };

    saveShoppingLists(updatedShoppingLists);
  }

  function addManualItem(event) {
    event.preventDefault();

    const label = manualItem.trim();

    if (!label) {
      showToast("Écris quelque chose à ajouter", "info");

      return;
    }

    const newItem = {
      id: `manual-${crypto.randomUUID()}`,
      name: label,
    };

    const updatedWeek = {
      ...currentShoppingState,

      manualItems: [...currentShoppingState.manualItems, newItem],
    };

    const updatedShoppingLists = {
      ...shoppingLists,

      [weekKey]: updatedWeek,
    };

    saveShoppingLists(updatedShoppingLists);

    setManualItem("");

    showToast("Article ajouté");
  }

  function removeManualItem(itemId) {
    const updatedManualItems = currentShoppingState.manualItems.filter(
      (item) => item.id !== itemId,
    );

    const updatedChecked = {
      ...currentShoppingState.checked,
    };

    delete updatedChecked[itemId];

    const updatedWeek = {
      ...currentShoppingState,

      manualItems: updatedManualItems,

      checked: updatedChecked,
    };

    const updatedShoppingLists = {
      ...shoppingLists,

      [weekKey]: updatedWeek,
    };

    saveShoppingLists(updatedShoppingLists);

    showToast("Article supprimé");
  }

  function previousWeek() {
    setCurrentMonday((current) => addDays(current, -7));
  }

  function nextWeek() {
    setCurrentMonday((current) => addDays(current, 7));
  }

  function goToCurrentWeek() {
    setCurrentMonday(getMonday(new Date()));
  }

  function buildShoppingListText() {
    if (allItems.length === 0) {
      return "Liste de courses vide.";
    }

    const lines = allItems.map((item) => {
      const checked = currentShoppingState.checked?.[item.id];

      const prefix = checked ? "☑" : "☐";

      const quantity =
        item.type === "automatic"
          ? ` — ${formatQuantityUnit(item.quantity, item.unit)}`
          : "";

      return `${prefix} ${item.name}${quantity}`;
    });

    return [
      `Liste de courses — ${formatWeekRange(currentMonday)}`,
      "",
      ...lines,
    ].join("\n");
  }

  async function copyShoppingList() {
    const text = buildShoppingListText();

    try {
      await navigator.clipboard.writeText(text);

      showToast("Liste copiée");
    } catch {
      showToast("Impossible de copier la liste", "info");
    }
  }

  function sendShoppingListByMail() {
    const text = buildShoppingListText();

    const subject = `Liste de courses — ${formatWeekRange(currentMonday)}`;

    const mailto = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(text)}`;

    window.location.href = mailto;
  }

  return (
    <main className="min-h-screen bg-surface-dark text-app-text">
      <div className="flex min-h-screen w-full">
        <Sidebar active="courses" />

        <div className="min-w-0 flex-1 px-5 py-6 pb-28 sm:px-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-14">
          {/* HEADER */}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full">
              <p className="text-xs tracking-[0.18em] text-accent uppercase">
                Organisation
              </p>

              <h1
                className="mt-2 text-4xl sm:text-5xl"
                style={{
                  fontFamily: "var(--font-playfair)",
                }}
              >
                Liste de courses
              </h1>

              <div className="mt-4 h-px w-1/2 bg-linear-to-r from-peach/80 via-peach/35 to-transparent" />

              <p className="mt-3 text-sm leading-6 text-muted">
                Ta liste se construit automatiquement à partir des recettes
                prévues dans ton planning.
              </p>
            </div>

            <button
              type="button"
              onClick={goToCurrentWeek}
              disabled={isCurrentWeek}
              className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
                isCurrentWeek
                  ? "cursor-default border-accent/20 text-accent-light"
                  : "border-white/8 bg-white/3 text-muted hover:bg-white/6 hover:text-white"
              }`}
            >
              {isCurrentWeek ? <Check size={17} /> : <CalendarDays size={17} />}

              {isCurrentWeek ? "Semaine actuelle" : "Revenir à cette semaine"}
            </button>
          </div>

          {/* WEEK */}

          <section className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/7 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <button
                type="button"
                onClick={previousWeek}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-surface-dark text-muted transition-colors hover:border-white/15 hover:text-white"
                aria-label="Semaine précédente"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-peach" />

                  <p className="text-xs tracking-[0.15em] text-subtle uppercase">
                    Liste pour la semaine
                  </p>
                </div>

                <p
                  className="mt-0.5 text-xl sm:text-2xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  {formatWeekRange(currentMonday)}
                </p>
              </div>

              <button
                type="button"
                onClick={nextWeek}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-surface-dark text-muted transition-colors hover:border-white/15 hover:text-white sm:hidden"
                aria-label="Semaine suivante"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/7 bg-surface-dark px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent-light">
                  <Utensils size={17} />
                </div>

                <div>
                  <p className="text-sm font-medium text-app-text">
                    {plannedRecipesCount}
                  </p>

                  <p className="text-[11px] text-subtle">recettes prévues</p>
                </div>
              </div>

              <button
                type="button"
                onClick={nextWeek}
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-surface-dark text-muted transition-colors hover:border-white/15 hover:text-white sm:flex"
                aria-label="Semaine suivante"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </section>

          {/* CONTENT */}

          <div className="mt-6 grid gap-6 min-[2200px]:grid-cols-[minmax(0,1fr)_300px]">
            {/* LIST */}

            <section className="overflow-hidden rounded-3xl border border-white/7 bg-surface">
              <div className="flex items-start justify-between gap-5 border-b border-white/6 p-6 sm:p-7">
                <div>
                  <p className="text-xs tracking-[0.18em] text-peach uppercase">
                    À prendre
                  </p>

                  <h2
                    className="mt-1 text-2xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Mes courses
                  </h2>
                </div>

                {allItems.length > 0 && (
                  <div className="rounded-xl border border-white/7 bg-surface-dark px-3 py-2 text-right">
                    <p className="text-sm font-medium text-app-text">
                      {checkedCount} / {allItems.length}
                    </p>

                    <p className="text-[10px] text-subtle">déjà cochés</p>
                  </div>
                )}
              </div>

              {allItems.length === 0 ? (
                <div className="flex min-h-90 flex-col items-center justify-center px-6 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent-light">
                    <ShoppingBasket size={26} />
                  </div>

                  <h3
                    className="mt-5 text-2xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Rien à acheter
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                    Ajoute des recettes à ton planning ou complète la liste
                    manuellement.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {automaticItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      checked={Boolean(currentShoppingState.checked?.[item.id])}
                      name={item.name}
                      quantity={formatQuantityUnit(item.quantity, item.unit)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}

                  {currentShoppingState.manualItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      checked={Boolean(currentShoppingState.checked?.[item.id])}
                      name={item.name}
                      manual
                      onToggle={() => toggleItem(item.id)}
                      onRemove={() => removeManualItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* RIGHT */}

            <aside className="grid gap-4 sm:grid-cols-2 min-[2200px]:block min-[2200px]:space-y-4">
              {/* MANUAL */}

              <section className="rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <p className="text-xs tracking-[0.16em] text-peach uppercase">
                  Ajout manuel
                </p>

                <h2
                  className="mt-1 text-xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Il manque quelque chose ?
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Ajoute ce qui n’est pas lié à une recette.
                </p>

                <form onSubmit={addManualItem} className="mt-5">
                  <input
                    type="text"
                    value={manualItem}
                    onChange={(event) => setManualItem(event.target.value)}
                    placeholder="Ex : Papier toilette"
                    className="w-full rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 text-sm text-app-text outline-none placeholder:text-subtle focus:border-accent/50"
                  />

                  <button
                    type="submit"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-peach/20 bg-peach/8 px-4 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12"
                  >
                    <Plus size={16} />
                    Ajouter à la liste
                  </button>
                </form>
              </section>

              {/* EXPORT */}

              <section className="rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <p className="text-xs tracking-[0.16em] text-subtle uppercase">
                  Export
                </p>

                <h2
                  className="mt-1 text-xl"
                  style={{
                    fontFamily: "var(--font-playfair)",
                  }}
                >
                  Emporter la liste
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Copie ta liste ou prépare un mail avec tout déjà rempli.
                </p>

                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={copyShoppingList}
                    disabled={allItems.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-peach/20 bg-peach/8 px-4 py-3 text-sm font-medium text-peach-light transition-colors hover:border-peach/35 hover:bg-peach/12 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Copy size={16} />
                    Copier la liste
                  </button>

                  <button
                    type="button"
                    onClick={sendShoppingListByMail}
                    disabled={allItems.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/8 px-4 py-3 text-sm text-muted transition-colors hover:border-white/15 hover:bg-white/3 hover:text-app-text disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Mail size={16} />
                    Envoyer par mail
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <MobileNav active="courses" />
    </main>
  );
}

function ShoppingItem({
  name,
  quantity,
  checked,
  manual = false,
  onToggle,
  onRemove,
}) {
  return (
    <div
      className={`group flex items-center gap-4 px-5 py-4 transition-colors sm:px-7 ${
        checked ? "bg-white/1.5" : "hover:bg-white/2.5"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          checked
            ? "border-accent bg-accent text-white"
            : "border-white/15 bg-surface-dark text-transparent hover:border-accent/60"
        }`}
        aria-label={checked ? `Décocher ${name}` : `Cocher ${name}`}
      >
        <Check size={14} />
      </button>

      <button
        type="button"
        onClick={onToggle}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={`truncate text-sm font-medium transition-colors ${
            checked ? "text-subtle line-through" : "text-app-text"
          }`}
        >
          {name}
        </p>

        {manual && (
          <p className="mt-0.5 text-[11px] text-subtle">Ajout manuel</p>
        )}
      </button>

      {quantity && (
        <span
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs ${
            checked ? "bg-white/3 text-subtle" : "bg-accent/8 text-peach-light"
          }`}
        >
          {quantity}
        </span>
      )}

      {manual && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label={`Supprimer ${name}`}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
