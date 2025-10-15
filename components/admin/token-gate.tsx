"use client";

import { useEffect, useState } from "react";
import { AdminDashboard } from "./dashboard";

const STORAGE_KEY = "mg-admin-token";

export function TokenGate() {
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      verify(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (candidate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        headers: {
          Authorization: `Bearer ${candidate}`,
        },
      });
      if (!res.ok) {
        throw new Error("Token inválido");
      }
      window.localStorage.setItem(STORAGE_KEY, candidate);
      setToken(candidate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
      window.localStorage.removeItem(STORAGE_KEY);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <AdminDashboard token={token} />;
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Acceso restringido</h2>
      <p className="mt-2 text-sm text-slate-600">
        Ingresá el token de administrador para cargar o editar vehículos.
      </p>
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void verify(input.trim());
        }}
      >
        <input
          type="password"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="ADMIN_TOKEN"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
