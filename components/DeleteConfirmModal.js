"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Fermer"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#18242D] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertTriangle size={22} />
        </div>

        <h2
          className="mt-5 text-2xl"
          style={{
            fontFamily: "var(--font-playfair)",
          }}
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
