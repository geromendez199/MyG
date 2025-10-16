import "server-only";
import React, { cache } from "react";

import { Hero } from "@/components/hero";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { VehicleCard } from "@/components/vehicle-card";
import { fetchVehicles } from "@/lib/vehicle-repository";
import { vehicleFiltersSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getVehicles = cache(async function getVehicles(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  const parsed = vehicleFiltersSchema.safeParse(normalized);
  const filters = parsed.success ? parsed.data : vehicleFiltersSchema.parse({});
  // Al cachear evitamos recalcular la misma combinación de filtros dentro del render del servidor.
  return fetchVehicles(filters);
});

async function VehiclesSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { items, page, totalPages, total, fallback } = await getVehicles(searchParams);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-12 text-center text-slate-500 shadow-sm">
        No encontramos vehículos con esos filtros. Ajustá la búsqueda o escribinos para que te avisemos cuando haya nuevas unidades.
      </div>
    );
  }

  const label = total === 1 ? "1 vehículo disponible" : `${total} vehículos disponibles`;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {fallback ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Estamos mostrando un catálogo de demostración porque no pudimos conectarnos a la base de datos. Configurá la
            variable <code>DATABASE_URL</code> y ejecutá las migraciones para ver tus vehículos reales.
          </div>
        ) : null}
        <header className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Resultados</h2>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Ordenado por publicaciones recientes
          </span>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3" id="inventario">
          {items.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
        <div className="mt-8">
          <React.Suspense fallback={<div className="flex justify-center py-6 text-sm text-slate-500">Cargando paginación...</div>}>
            <Pagination page={page} totalPages={totalPages} />
          </React.Suspense>
        </div>
      </section>
    </div>
  );
}

export default function SitePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="space-y-16">
      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <Hero />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4">
        <section className="grid gap-8 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Filtrar resultados</h2>
              <p className="mt-1 text-sm text-slate-500">Acotá tu búsqueda por marca, año o precio.</p>
              <Filters className="mt-6" />
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">¿Necesitás ayuda?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Nuestro equipo te asesora para encontrar la mejor financiación, coordinar visitas y gestionar la transferencia del vehículo.
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Atención de lunes a sábado</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">¿Cómo publico mis autos?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Ingresá al panel de administración con tu token, cargá fotos, precio y vendedor, y publicá en un clic.
              </p>
              <a className="btn-secondary mt-4 w-full" href="/admin">
                Ir al panel administrativo
              </a>
            </div>
          </aside>
          <VehiclesSection searchParams={searchParams} />
        </section>
      </div>
    </div>
  );
}
