"use client";

import useSWR from "swr";

interface HealthResponse {
  ok: boolean;
  error?: string;
}

const fetcher = async (url: string): Promise<HealthResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as HealthResponse;
    return { ok: false, error: payload.error ?? `Status ${response.status}` };
  }
  return (await response.json()) as HealthResponse;
};

export function ConnectionBadge() {
  const { data, error, isValidating, mutate } = useSWR<HealthResponse>(
    "/api/health/db",
    fetcher,
    { refreshInterval: 60_000 },
  );

  const healthy = data?.ok === true && !error;
  const message = healthy
    ? "Conexión Supabase activa"
    : "Sin conexión a la base de datos";
  const details = !healthy ? data?.error ?? error?.message : undefined;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${
          healthy
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${healthy ? "bg-emerald-500" : "bg-amber-500"}`} />
        {message}
      </span>
      <button
        type="button"
        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        onClick={() => mutate()}
        disabled={isValidating}
      >
        {isValidating ? "Verificando..." : "Reintentar"}
      </button>
      {!healthy && details && (
        <span className="text-xs text-amber-700">{details}</span>
      )}
    </div>
  );
}
