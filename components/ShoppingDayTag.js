"use client";

import { ShoppingBasket } from "lucide-react";

export default function ShoppingDayTag({
  active = false,
  compact = false,
  onClick,
}) {
  if (active) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-peach/25 bg-peach/10 font-medium text-peach-light transition-colors hover:border-peach/40 hover:bg-peach/15 ${
          compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-[10px]"
        }`}
        title="Retirer le jour de courses"
      >
        <ShoppingBasket size={compact ? 11 : 12} strokeWidth={1.8} />
        Courses
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center justify-center rounded-full border border-transparent text-subtle transition-colors hover:border-white/8 hover:bg-white/4 hover:text-peach ${
        compact ? "h-7 w-7" : "h-7 w-7"
      }`}
      title="Prévoir les courses ce jour"
      aria-label="Prévoir les courses ce jour"
    >
      <ShoppingBasket
        size={13}
        strokeWidth={1.7}
        className="opacity-55 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}
