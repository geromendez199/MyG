"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { VehicleForm, AdminVehicle } from "./vehicle-form";

interface ApiVehicle extends AdminVehicle {
  seller: {
    id: string;
    name: string;
    phoneE164: string;
  };
}

interface VehicleResponse {
  items: ApiVehicle[];
  pagination: {
    total: number;
  };
  fallback: boolean;
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(async (res) => {
    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || "Error al cargar vehículos");
    }
    return res.json();
  });

interface AdminDashboardProps {
  token: string;
}

export function AdminDashboard({ token }: AdminDashboardProps) {
  const { data, isLoading, error, mutate } = useSWR<VehicleResponse>(
    token ? ["/api/vehicles?includeDrafts=true&perPage=100", token] : null,
    (args: [string, string]) => fetcher(args[0], args[1]),
    { refreshInterval: 60_000 },
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fallback = data?.fallback ?? false;

  const selectedVehicle = useMemo(() => {
    if (!data?.items || !selectedId) return undefined;
    return data.items.find((vehicle) => vehicle.id === selectedId);
  }, [data?.items, selectedId]);

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Vehículos</h2>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {data?.pagination.total ?? 0}
            </span>
          </div>
          <button
            type="button"
            className="mt-4 w-full btn-secondary"
            onClick={() => setSelectedId(null)}
          >
            + Nuevo vehículo
          </button>
          <ul className="mt-4 space-y-2">
            {isLoading && <li className="text-sm text-slate-500">Cargando...</li>}
            {error && <li className="text-sm text-red-600">{error.message}</li>}
            {data?.items.map((vehicle) => (
              <li key={vehicle.id}>
                <button
                  type="button"
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm shadow-sm transition ${
                    selectedId === vehicle.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  onClick={() => setSelectedId(vehicle.id ?? null)}
                >
                  <span className="block font-medium">{vehicle.title}</span>
                  <span className="text-xs text-slate-500">
                    {vehicle.brand} · {vehicle.year}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              {selectedVehicle ? "Editar vehículo" : "Crear vehículo"}
            </h2>
            {fallback && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                Demo sin base de datos
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Completá los campos y recordá cargar al menos una imagen para destacarlo en la landing.
          </p>
        </div>
        <VehicleForm
          token={token}
          vehicle={selectedVehicle}
          onSaved={() => {
            void mutate();
          }}
          fallback={fallback}
        />
      </main>
    </div>
  );
}
