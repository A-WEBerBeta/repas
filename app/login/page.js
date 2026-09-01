"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/planning");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-dark px-4 text-app-text">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-white/8 bg-surface p-7"
      >
        <p className="text-xs tracking-[0.18em] text-peach uppercase">repas.</p>

        <h1
          className="mt-2 text-4xl"
          style={{
            fontFamily: "var(--font-playfair)",
          }}
        >
          Connexion
        </h1>

        <div className="mt-4 h-px w-24 bg-linear-to-r from-peach/70 to-transparent" />

        <div className="mt-7 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Adresse email"
            required
            className="w-full rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 text-sm outline-none placeholder:text-subtle focus:border-accent/50"
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mot de passe"
            required
            className="w-full rounded-xl border border-white/8 bg-surface-dark px-4 py-3.5 text-sm outline-none placeholder:text-subtle focus:border-accent/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-peach/25 bg-peach/10 px-4 py-3.5 text-sm font-medium text-peach-light transition-colors hover:border-peach/40 hover:bg-peach/15 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-muted">{message}</p>
        )}
      </form>
    </main>
  );
}
