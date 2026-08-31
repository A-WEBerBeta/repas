import Image from "next/image";
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

export default function Sidebar({ active = "planning" }) {
  return (
    <aside className="hidden min-h-screen w-55 shrink-0 border-r border-white/5 bg-background px-5 py-7 lg:flex lg:flex-col xl:w-60 2xl:w-65">
      {/* LOGO */}

      <div className="px-2">
        <Link href="/planning" className="inline-block">
          <div
            className="text-[38px] leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-playfair)",
            }}
          >
            repas
            <span className="text-peach">.</span>
          </div>

          <p className="mt-2 text-[10px] tracking-[0.28em] text-subtle uppercase">
            mon carnet
          </p>
        </Link>
      </div>

      {/* NAV */}

      <nav className="mt-14 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive = active === item.name;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                isActive
                  ? "bg-surface text-app-text"
                  : "text-muted hover:bg-white/2.5 hover:text-app-text"
              }`}
            >
              {/* ACTIVE BAR */}

              {isActive && (
                <span className="absolute bottom-3 left-0 top-3 w-0.75 rounded-full bg-accent" />
              )}

              {/* ICON */}

              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                  isActive
                    ? "border-accent/15 bg-accent/10 text-peach-light"
                    : "border-white/5 bg-white/2 text-subtle group-hover:border-white/10 group-hover:text-app-text"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>

              <span className="text-sm font-medium">{item.label}</span>

              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-peach" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM */}

      <div className="mt-auto pt-8">
        <Link
          href="/recettes/nouvelle"
          className="group flex items-center gap-3 rounded-2xl border border-peach/15 bg-peach/4 p-3 transition hover:border-peach/30 hover:bg-peach/[0.07]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-peach/10 text-peach transition group-hover:bg-peach/15">
            <Plus size={18} strokeWidth={1.8} />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-medium text-peach-light">
              Nouvelle recette
            </p>

            <p className="mt-0.5 text-[10px] text-subtle">Ajouter au carnet</p>
          </div>
        </Link>

        <div className="my-5 h-px bg-white/5" />

        <div className="flex items-center gap-3 px-2">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden">
            <Image
              src="/akiro-logo.png"
              alt="Logo Akiro Studio"
              fill
              className="object-contain p-1.5"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-app-text">Akiro Studio</p>

            <p className="mt-0.5 text-[10px] text-subtle">React • Next.js</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
