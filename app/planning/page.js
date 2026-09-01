"use client";

import MealModal from "@/components/MealModal";
import MobileNav from "@/components/MobileNav";
import ShoppingDayTag from "@/components/ShoppingDayTag";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";
import { loadUserState, saveUserState } from "@/lib/userState";

import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBasket,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useRef, useState } from "react";

const days = [
  {
    key: "monday",
    label: "Lundi",
  },
  {
    key: "tuesday",
    label: "Mardi",
  },
  {
    key: "wednesday",
    label: "Mercredi",
  },
  {
    key: "thursday",
    label: "Jeudi",
  },
  {
    key: "friday",
    label: "Vendredi",
  },
  {
    key: "saturday",
    label: "Samedi",
  },
  {
    key: "sunday",
    label: "Dimanche",
  },
];

const meals = [
  {
    key: "lunch",
    label: "Midi",
  },
  {
    key: "dinner",
    label: "Soir",
  },
];

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

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
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

function getWeekKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function PlanningPage() {
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);

  const [planning, setPlanning] = useState({});

  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));

  const [editingSlot, setEditingSlot] = useState(null);

  const [mode, setMode] = useState("recipe");

  const [selectedRecipeId, setSelectedRecipeId] = useState("");

  const [selectedServings, setSelectedServings] = useState(1);

  const [customLabel, setCustomLabel] = useState("");

  const [shoppingDays, setShoppingDays] = useState({});

  const today = new Date();

  const weekKey = useMemo(() => getWeekKey(currentMonday), [currentMonday]);

  const currentPlanning = useMemo(() => {
    return planning[weekKey] || {};
  }, [planning, weekKey]);

  const currentShoppingDay = shoppingDays[weekKey] || null;

  const plannedMealsCount = useMemo(() => {
    let count = 0;

    days.forEach((day) => {
      meals.forEach((meal) => {
        if (currentPlanning?.[day.key]?.[meal.key]) {
          count += 1;
        }
      });
    });

    return count;
  }, [currentPlanning]);

  const plannedRecipeCount = useMemo(() => {
    let count = 0;

    days.forEach((day) => {
      meals.forEach((meal) => {
        const slot = currentPlanning?.[day.key]?.[meal.key];

        if (slot?.type === "recipe") {
          count += 1;
        }
      });
    });

    return count;
  }, [currentPlanning]);

  const isCurrentWeek = isSameDay(currentMonday, getMonday(today));

  const progressPercent = Math.round((plannedMealsCount / 14) * 100);

  const progressAngle = (progressPercent / 100) * 360;

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadUserState();

        setRecipes(data.recipes);
        setPlanning(data.planning);
        setShoppingDays(data.shoppingDays);
      } catch (error) {
        console.error("Erreur chargement Supabase :", error);

        showToast("Impossible de charger les données", "info");
      }
    }

    loadData();
  }, [showToast]);

  async function savePlanning(updatedPlanning) {
    setPlanning(updatedPlanning);

    try {
      await saveUserState({
        planning: updatedPlanning,
      });
    } catch (error) {
      console.error("Erreur sauvegarde planning :", error);

      showToast("Le planning n’a pas pu être synchronisé", "info");
    }
  }

  function openSlot(dayKey, mealKey) {
    const existing = currentPlanning?.[dayKey]?.[mealKey];

    setEditingSlot({
      dayKey,
      mealKey,
    });

    if (existing?.type === "recipe") {
      setMode("recipe");

      setSelectedRecipeId(existing.recipeId || "");

      setSelectedServings(
        Number(existing.servings) > 0 ? Number(existing.servings) : 1,
      );

      setCustomLabel("");

      return;
    }

    if (existing?.type === "text") {
      setMode("text");

      setCustomLabel(existing.label || "");

      setSelectedRecipeId("");

      setSelectedServings(1);

      return;
    }

    setMode("recipe");

    setSelectedRecipeId("");

    setSelectedServings(1);

    setCustomLabel("");
  }

  function closeSlot() {
    setEditingSlot(null);

    setSelectedRecipeId("");

    setSelectedServings(1);

    setCustomLabel("");

    setMode("recipe");
  }

  function saveSlot() {
    if (!editingSlot) return;

    let value = null;

    if (mode === "recipe") {
      if (!selectedRecipeId) {
        showToast("Choisis une recette", "info");

        return;
      }

      value = {
        type: "recipe",
        recipeId: selectedRecipeId,
        servings: Math.max(1, Number(selectedServings) || 1),
      };
    }

    if (mode === "text") {
      if (!customLabel.trim()) {
        showToast("Écris ce que tu prévois", "info");

        return;
      }

      value = {
        type: "text",
        label: customLabel.trim(),
      };
    }

    const updatedWeek = {
      ...currentPlanning,

      [editingSlot.dayKey]: {
        ...currentPlanning?.[editingSlot.dayKey],

        [editingSlot.mealKey]: value,
      },
    };

    const updatedPlanning = {
      ...planning,

      [weekKey]: updatedWeek,
    };

    savePlanning(updatedPlanning);

    showToast("Planning mis à jour");

    closeSlot();
  }

  function removeSlot(dayKey, mealKey) {
    const updatedDay = {
      ...currentPlanning?.[dayKey],
    };

    delete updatedDay[mealKey];

    const updatedWeek = {
      ...currentPlanning,

      [dayKey]: updatedDay,
    };

    const updatedPlanning = {
      ...planning,

      [weekKey]: updatedWeek,
    };

    savePlanning(updatedPlanning);

    showToast("Repas retiré");
  }

  function toggleShoppingDay(dayKey) {
    const updatedShoppingDays = {
      ...shoppingDays,
    };

    if (currentShoppingDay === dayKey) {
      delete updatedShoppingDays[weekKey];

      showToast("Jour de courses retiré");
    } else {
      updatedShoppingDays[weekKey] = dayKey;

      const day = days.find((item) => item.key === dayKey);

      showToast(`Courses prévues ${day?.label.toLowerCase() || ""}`);
    }

    setShoppingDays(updatedShoppingDays);

    saveUserState({
      shoppingDays: updatedShoppingDays,
    }).catch((error) => {
      console.error("Erreur sauvegarde jour de courses :", error);

      showToast("Le jour de courses n’a pas pu être synchronisé", "info");
    });
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

  function getRecipe(recipeId) {
    return recipes.find((recipe) => String(recipe.id) === String(recipeId));
  }

  return (
    <main className="min-h-screen bg-surface-dark text-app-text">
      <div className="flex min-h-screen w-full">
        <Sidebar active="planning" />

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
                Planning semaine
              </h1>

              <div className="mt-4 h-px w-1/2 bg-linear-to-r from-peach/80 via-peach/35 to-transparent" />

              <p className="mt-3 text-sm leading-6 text-muted">
                Organise tes repas de la semaine et prépare tranquillement la
                suite.
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

          {/* DASHBOARD */}

          <div className="mt-8 grid gap-6 min-[2200px]:grid-cols-[minmax(0,1fr)_280px]">
            {/* LEFT */}

            <div className="min-w-0">
              {/* WEEK BAR */}

              <section className="flex flex-col gap-4 rounded-3xl border border-white/7 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
                        Semaine
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

                <button
                  type="button"
                  onClick={nextWeek}
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-surface-dark text-muted transition-colors hover:border-white/15 hover:text-white sm:flex"
                  aria-label="Semaine suivante"
                >
                  <ChevronRight size={18} />
                </button>
              </section>

              {/* DESKTOP GRID */}

              <div className="mt-5 hidden h-[clamp(380px,calc(100dvh-560px),620px)] gap-3 xl:grid xl:grid-cols-7 min-[2200px]:h-[clamp(520px,calc(100dvh-360px),760px)]">
                {days.map((day, dayIndex) => {
                  const date = addDays(currentMonday, dayIndex);

                  const isToday = isSameDay(date, today);

                  return (
                    <section
                      key={day.key}
                      className={`flex h-full min-w-0 flex-col rounded-3xl border p-3 transition-colors ${
                        isToday
                          ? "border-accent/45 bg-accent/4.5 shadow-[0_0_0_1px_rgba(79,150,147,0.08),0_20px_50px_rgba(0,0,0,0.18)]"
                          : "border-white/7 bg-surface"
                      }`}
                    >
                      <div className="px-1 pb-4 pt-1 text-center">
                        {isToday && (
                          <span className="mb-2 inline-flex rounded-full border border-accent/20 bg-accent/12 px-2.5 py-1 text-xs font-medium text-peach-light">
                            Today
                          </span>
                        )}

                        <h2
                          className="text-lg 2xl:text-xl"
                          style={{
                            fontFamily: "var(--font-playfair)",
                          }}
                        >
                          {day.label}
                        </h2>

                        <p
                          className={`mt-1 text-[11px] ${
                            isToday ? "text-accent-light" : "text-subtle"
                          }`}
                        >
                          {formatDate(date)}
                        </p>

                        <div className="mt-2 flex min-h-7 items-center justify-center">
                          <ShoppingDayTag
                            active={currentShoppingDay === day.key}
                            onClick={() => toggleShoppingDay(day.key)}
                          />
                        </div>
                      </div>

                      <div className="grid min-h-0 flex-1 grid-rows-2 gap-4">
                        {meals.map((meal) => {
                          const slot = currentPlanning?.[day.key]?.[meal.key];

                          return (
                            <div
                              key={meal.key}
                              className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]"
                            >
                              <p className="mb-2 px-1 text-[11px] text-muted">
                                {meal.label}
                              </p>

                              <MealSlot
                                slot={slot}
                                recipe={
                                  slot?.type === "recipe"
                                    ? getRecipe(slot.recipeId)
                                    : null
                                }
                                onEdit={() => openSlot(day.key, meal.key)}
                                onRemove={() => removeSlot(day.key, meal.key)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* MOBILE / TABLET */}

              <div className="mt-5 space-y-4 xl:hidden">
                {days.map((day, dayIndex) => {
                  const date = addDays(currentMonday, dayIndex);

                  const isToday = isSameDay(date, today);

                  return (
                    <section
                      key={day.key}
                      className="rounded-3xl border border-white/7 bg-surface p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <h2
                            className="text-2xl"
                            style={{
                              fontFamily: "var(--font-playfair)",
                            }}
                          >
                            {day.label}
                          </h2>

                          {isToday && (
                            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent-light">
                              Aujourd’hui
                            </span>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <p
                            className={`text-xs ${
                              isToday ? "text-accent-light" : "text-subtle"
                            }`}
                          >
                            {formatDate(date)}
                          </p>

                          <ShoppingDayTag
                            compact
                            active={currentShoppingDay === day.key}
                            onClick={() => toggleShoppingDay(day.key)}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {meals.map((meal) => {
                          const slot = currentPlanning?.[day.key]?.[meal.key];

                          return (
                            <div
                              key={meal.key}
                              className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3"
                            >
                              <p className="text-xs text-muted">{meal.label}</p>

                              <MealSlot
                                slot={slot}
                                recipe={
                                  slot?.type === "recipe"
                                    ? getRecipe(slot.recipeId)
                                    : null
                                }
                                compact
                                onEdit={() => openSlot(day.key, meal.key)}
                                onRemove={() => removeSlot(day.key, meal.key)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            {/* RIGHT DASHBOARD */}

            <aside className="grid gap-4 sm:grid-cols-3 min-[2200px]:block min-[2200px]:space-y-4">
              {/* STATS */}

              <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/5 blur-3xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                      <Utensils size={18} />
                    </div>

                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(
                            rgba(111, 207, 198, 0.95) ${progressAngle}deg,
                            rgba(255,255,255,0.07) ${progressAngle}deg 360deg
                          )`,
                        }}
                      />

                      <div className="absolute inset-0.5 rounded-full bg-surface" />

                      <div
                        className="absolute inset-1.5 rounded-full"
                        style={{
                          background: `conic-gradient(
                            rgba(255, 193, 163, 0.95) ${progressAngle}deg,
                            rgba(255,255,255,0.05) ${progressAngle}deg 360deg
                          )`,
                        }}
                      />

                      <div className="absolute inset-2 rounded-full bg-surface-dark" />

                      <span className="relative z-10 text-xs font-medium text-peach-light">
                        {progressPercent}%
                      </span>
                    </div>
                  </div>

                  <p
                    className="mt-5 text-4xl text-peach-light"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    {plannedMealsCount}

                    <span className="ml-1 text-xl text-subtle">/ 14</span>
                  </p>

                  <p className="mt-1 text-sm text-muted">repas planifiés</p>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{
                        width: `${Math.min(progressPercent, 100)}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-[11px] text-subtle">
                    {plannedRecipeCount}{" "}
                    {plannedRecipeCount > 1 ? "recettes" : "recette"} cette
                    semaine
                  </p>
                </div>
              </section>

              {/* COURSES */}

              <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-peach/5 blur-3xl" />

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                    <ShoppingBasket size={18} />
                  </div>

                  <p className="mt-5 text-xs tracking-[0.16em] text-peach uppercase">
                    Courses
                  </p>

                  <h2
                    className="mt-1 text-xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Liste de la semaine
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    Générée automatiquement à partir de tes recettes planifiées.
                  </p>

                  <Link
                    href="/courses"
                    className="group mt-5 flex items-center justify-between rounded-xl border border-white/8 px-4 py-3 text-sm text-app-text transition-colors hover:border-peach/25 hover:bg-peach/5"
                  >
                    Ouvrir la liste
                    <ArrowRight
                      size={16}
                      className="text-peach transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </section>

              {/* NEW RECIPE */}

              <section className="relative overflow-hidden rounded-3xl border border-white/7 bg-surface p-5 2xl:p-6">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-peach-light">
                    <Sparkles size={18} />
                  </div>

                  <p className="mt-5 text-xs tracking-[0.16em] text-subtle uppercase">
                    Recettes
                  </p>

                  <h2
                    className="mt-1 text-xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    Une nouvelle idée ?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    Ajoute une recette à ton carnet puis place-la dans la
                    semaine.
                  </p>

                  <Link
                    href="/recettes/nouvelle"
                    className="group mt-5 flex items-center justify-between rounded-xl border border-peach/20 bg-peach/5 px-4 py-3 text-sm font-medium text-peach transition-colors hover:border-peach/35 hover:bg-peach/10"
                  >
                    Nouvelle recette
                    <Plus
                      size={16}
                      className="transition-transform group-hover:rotate-90"
                    />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <MobileNav active="planning" />

      {/* MODAL */}

      <MealModal
        open={Boolean(editingSlot)}
        recipes={recipes}
        mode={mode}
        setMode={setMode}
        selectedRecipeId={selectedRecipeId}
        setSelectedRecipeId={setSelectedRecipeId}
        selectedServings={selectedServings}
        setSelectedServings={setSelectedServings}
        customLabel={customLabel}
        setCustomLabel={setCustomLabel}
        onClose={closeSlot}
        onSave={saveSlot}
      />
    </main>
  );
}

function MealSlot({ slot, recipe, onEdit, onRemove, compact = false }) {
  if (!slot) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={`group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/1.5 text-peach transition duration-200 hover:border-peach/30 hover:bg-peach/5 ${
          compact ? "min-h-16 px-4" : "h-full min-h-0 flex-col px-3"
        }`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-peach/10 text-peach transition-colors group-hover:bg-peach/20 group-hover:text-peach-light">
          <Plus size={17} />
        </div>

        {!compact && <span className="text-xs text-peach">Ajouter</span>}
      </button>
    );
  }

  if (slot.type === "text") {
    const content = (
      <div
        className={`group relative overflow-hidden rounded-2xl border border-white/7 bg-surface-light ${
          compact ? "min-h-16" : "h-full min-h-0"
        }`}
      >
        <button
          type="button"
          onClick={onEdit}
          className={`flex h-full w-full items-center text-left ${
            compact
              ? "gap-3 px-4 py-3"
              : "flex-col justify-center px-3 py-5 text-center"
          }`}
        >
          <Utensils size={compact ? 16 : 19} className="shrink-0 text-subtle" />

          <p className="min-w-0 truncate text-sm font-medium text-app-text">
            {slot.label}
          </p>
        </button>

        {!compact && <DesktopDeleteButton onRemove={onRemove} />}
      </div>
    );

    if (compact) {
      return <SwipeableSlot onRemove={onRemove}>{content}</SwipeableSlot>;
    }

    return content;
  }

  if (slot.type === "recipe") {
    if (!recipe) {
      const content = (
        <div
          className={`relative flex items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/5 px-10 text-xs text-red-400 ${
            compact ? "min-h-16" : "h-full min-h-0"
          }`}
        >
          Recette introuvable
          {!compact && <DesktopDeleteButton onRemove={onRemove} />}
        </div>
      );

      if (compact) {
        return <SwipeableSlot onRemove={onRemove}>{content}</SwipeableSlot>;
      }

      return content;
    }

    const servings = Number(slot.servings) || 1;

    const content = (
      <div
        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-surface-dark transition-colors hover:border-peach/25 ${
          compact ? "min-h-16" : "h-full min-h-0"
        }`}
      >
        <button
          type="button"
          onClick={onEdit}
          className={`flex h-full w-full text-left ${
            compact ? "items-center gap-3 p-2" : "flex-col"
          }`}
        >
          {recipe.image ? (
            <div
              className={`relative overflow-hidden ${
                compact
                  ? "h-12 w-16 shrink-0 rounded-xl"
                  : "min-h-0 w-full flex-1"
              }`}
            >
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <div
              className={`flex items-center justify-center bg-peach/8 text-peach ${
                compact
                  ? "h-12 w-16 shrink-0 rounded-xl"
                  : "min-h-0 w-full flex-1"
              }`}
            >
              <Utensils size={18} />
            </div>
          )}

          <div className={compact ? "min-w-0 flex-1" : "w-full p-3 pr-10"}>
            <p className="line-clamp-2 text-sm font-medium leading-5">
              {recipe.name}
            </p>

            <p
              className={`text-[11px] text-subtle ${
                compact ? "mt-0.5" : "mt-1.5"
              }`}
            >
              {servings} {servings > 1 ? "portions" : "portion"}
            </p>
          </div>
        </button>

        {!compact && <DesktopDeleteButton onRemove={onRemove} />}
      </div>
    );

    if (compact) {
      return <SwipeableSlot onRemove={onRemove}>{content}</SwipeableSlot>;
    }

    return content;
  }

  return null;
}

function SwipeableSlot({ children, onRemove }) {
  const [translateX, setTranslateX] = useState(0);

  const [dragging, setDragging] = useState(false);

  const startX = useRef(null);

  const startTranslate = useRef(0);

  const suppressClick = useRef(false);

  const actionWidth = 96;

  const dragThreshold = 15;

  function handlePointerDown(event) {
    startX.current = event.clientX;

    startTranslate.current = translateX;

    suppressClick.current = false;
  }

  function handlePointerMove(event) {
    if (startX.current === null) {
      return;
    }

    const difference = event.clientX - startX.current;

    if (Math.abs(difference) < dragThreshold && !dragging) {
      return;
    }

    setDragging(true);

    let next = startTranslate.current + difference;

    if (next > 0) {
      next = 0;
    }

    if (next < -actionWidth) {
      next = -actionWidth;
    }

    setTranslateX(next);
  }

  function handlePointerUp(event) {
    if (startX.current === null) {
      return;
    }

    const difference = event.clientX - startX.current;

    const reallyDragged = Math.abs(difference) >= dragThreshold;

    suppressClick.current = reallyDragged;

    if (reallyDragged) {
      if (translateX < -40) {
        setTranslateX(-actionWidth);
      } else {
        setTranslateX(0);
      }
    }

    startX.current = null;

    setDragging(false);
  }

  function handlePointerCancel() {
    startX.current = null;

    setDragging(false);

    if (translateX < -40) {
      setTranslateX(-actionWidth);
    } else {
      setTranslateX(0);
    }
  }

  function handleClickCapture(event) {
    if (suppressClick.current) {
      event.preventDefault();

      event.stopPropagation();

      suppressClick.current = false;

      return;
    }

    if (translateX < 0) {
      event.preventDefault();

      event.stopPropagation();

      setTranslateX(0);
    }
  }

  function handleDelete(event) {
    event.preventDefault();

    event.stopPropagation();

    setTranslateX(0);

    onRemove();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex w-24 items-stretch">
        <button
          type="button"
          onClick={handleDelete}
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border border-red-500/10 bg-red-500/15 text-red-400 transition-colors hover:border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
        >
          <X size={18} />

          <span className="text-[11px] font-medium">Supprimer</span>
        </button>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        style={{
          transform: `translateX(${translateX}px)`,
          touchAction: "pan-y",
        }}
        className={`relative z-10 rounded-2xl bg-surface select-none ${
          dragging
            ? "cursor-grabbing"
            : "cursor-grab transition-transform duration-200 ease-out"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function DesktopDeleteButton({ onRemove }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();

        onRemove();
      }}
      className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-black/60 text-muted backdrop-blur-md transition-colors hover:border-red-500/20 hover:bg-red-500/15 hover:text-red-400"
      aria-label="Supprimer ce repas"
    >
      <X size={15} />
    </button>
  );
}
