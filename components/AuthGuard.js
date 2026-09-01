"use client";

import { supabase } from "@/lib/supabase";

import { redirect, usePathname } from "next/navigation";

import { useEffect, useState } from "react";

export default function AuthGuard({ children }) {
  const pathname = usePathname();

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        if (error) {
          setStatus("guest");
          return;
        }

        if (!session) {
          setStatus("guest");
          return;
        }

        setStatus("authenticated");
      } catch (error) {
        if (!active) return;

        setStatus("guest");
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [pathname]);

  /*
   * Vérification en cours
   */
  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-dark text-app-text">
        <p className="text-sm text-subtle">Chargement...</p>
      </div>
    );
  }

  /*
   * Pas connecté + page protégée
   */
  if (status === "guest" && pathname !== "/login") {
    redirect("/login");
  }

  /*
   * Déjà connecté + page login
   */
  if (status === "authenticated" && pathname === "/login") {
    redirect("/planning");
  }

  return children;
}
