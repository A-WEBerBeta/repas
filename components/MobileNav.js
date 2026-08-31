"use client";

import Link from "next/link";

import {
  BookOpen,
  CalendarDays,
  Carrot,
  Plus,
  ShoppingBasket,
} from "lucide-react";

const items = [
  {
    name: "planning",
    label: "Planning",
    href: "/planning",
    icon: CalendarDays,
  },
  {
    name: "courses",
    label: "Courses",
    href: "/courses",
    icon: ShoppingBasket,
  },
  {
    name: "recipes",
    label: "Recettes",
    href: "/recettes",
    icon: BookOpen,
  },
  {
    name: "ingredients",
    label: "Ingrédients",
    href: "/ingredients",
    icon: Carrot,
  },
];

export default function MobileNav({ active, onAddIngredient }) {
  const showCenterAction =
    active === "ingredients" && typeof onAddIngredient === "function";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/7 bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 backdrop-blur-xl lg:hidden">
      <div
        className={`relative mx-auto max-w-xl ${
          showCenterAction
            ? "grid grid-cols-[1fr_1fr_64px_1fr_1fr] items-end gap-1"
            : "grid grid-cols-4 gap-1"
        }`}
      >
        <NavItem item={items[0]} active={active} />

        <NavItem item={items[1]} active={active} />

        {showCenterAction && (
          <div className="relative min-h-14.5">
            <button
              type="button"
              onClick={onAddIngredient}
              className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-7 items-center justify-center rounded-full border-[5px] border-background bg-peach text-background shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-colors hover:bg-peach-light"
              aria-label="Ajouter un ingrédient"
            >
              <Plus size={21} strokeWidth={2} />
            </button>
          </div>
        )}

        <NavItem item={items[2]} active={active} />

        <NavItem item={items[3]} active={active} />
      </div>
    </nav>
  );
}

function NavItem({ item, active }) {
  const Icon = item.icon;

  const isActive = active === item.name;

  return (
    <Link
      href={item.href}
      className={`group relative flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2.5 transition-colors ${
        isActive ? "text-accent-light" : "text-subtle hover:text-app-text"
      }`}
    >
      {isActive && (
        <span className="absolute top-0 h-1 w-5 rounded-full bg-peach" />
      )}

      <span
        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
          isActive
            ? "bg-accent/10 text-accent-light"
            : "text-subtle group-hover:text-app-text"
        }`}
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <span
        className={`mt-1 truncate text-[10px] font-medium ${
          isActive ? "text-app-text" : ""
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}
