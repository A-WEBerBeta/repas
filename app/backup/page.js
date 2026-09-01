"use client";

export default function BackupPage() {
  function exportData() {
    const data = {
      recipes: JSON.parse(localStorage.getItem("recipes") || "[]"),
      ingredients: JSON.parse(localStorage.getItem("ingredients") || "[]"),
      planning: JSON.parse(localStorage.getItem("planning") || "{}"),
      shoppingLists: JSON.parse(localStorage.getItem("shoppingLists") || "{}"),
      shoppingDays: JSON.parse(localStorage.getItem("shoppingDays") || "{}"),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `repas-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-dark px-4 text-app-text">
      <div className="w-full max-w-md rounded-3xl border border-white/8 bg-surface p-7 text-center">
        <p className="text-xs tracking-[0.18em] text-peach uppercase">
          Sauvegarde
        </p>

        <h1
          className="mt-2 text-3xl"
          style={{
            fontFamily: "var(--font-playfair)",
          }}
        >
          Exporter mes données
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Télécharge une copie de tes recettes, ingrédients, planning et courses
          avant la migration vers Supabase.
        </p>

        <button
          type="button"
          onClick={exportData}
          className="mt-6 w-full rounded-xl border border-peach/25 bg-peach/10 px-4 py-3.5 text-sm font-medium text-peach-light transition-colors hover:border-peach/40 hover:bg-peach/15"
        >
          Télécharger la sauvegarde
        </button>
      </div>
    </main>
  );
}
