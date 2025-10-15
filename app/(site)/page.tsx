import "server-only";
import React from "react";
import type { Prisma } from "@prisma/client";

import { Hero } from "@/components/hero";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { VehicleCard } from "@/components/vehicle-card";
import { db } from "@/lib/db";
import { vehicleFiltersSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type VehicleWithSeller = Prisma.VehicleGetPayload<{
  include: { seller: true };
}>;

interface VehiclesResult {
  items: VehicleWithSeller[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasError: boolean;
}

async function getVehicles(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<VehiclesResult> {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  const parsed = vehicleFiltersSchema.safeParse(normalized);
  const filters = parsed.success ? parsed.data : vehicleFiltersSchema.parse({});

  const where: Prisma.VehicleWhereInput = { published: true };

  if (filters.brand) {
    where.brand = { equals: filters.brand, mode: "insensitive" };
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { brand: { contains: filters.q, mode: "insensitive" } },
      { model: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.yearMin || filters.yearMax) {
    where.year = {};
    if (filters.yearMin) where.year.gte = filters.yearMin;
    if (filters.yearMax) where.year.lte = filters.yearMax;
  }
  if (filters.priceMin || filters.priceMax) {
    where.priceARS = {};
    if (filters.priceMin) where.priceARS.gte = filters.priceMin;
    if (filters.priceMax) where.priceARS.lte = filters.priceMax;
  }

  const skip = (filters.page - 1) * filters.perPage;
  const take = filters.perPage;

  try {
    const [items, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: { seller: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      db.vehicle.count({ where }),
    ]);

    return {
      items,
      page: filters.page,
      perPage: filters.perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
      hasError: false,
    };
  } catch (error) {
    console.error("Failed to load vehicles from the database", error);
    return {
      items: [],
      page: filters.page,
      perPage: filters.perPage,
      total: 0,
      totalPages: 1,
      hasError: true,
    };
  }
}

async function VehiclesSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { items, page, totalPages, total, hasError } = await getVehicles(searchParams);

  if (hasError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-red-700 shadow-sm">
        No pudimos conectarnos a la base de datos. Revisá la configuración de la variable <code>DATABASE_URL</code> y volvé a intentarlo.
      </div>
    );
  }

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
          </aside>
          <VehiclesSection searchParams={searchParams} />
        </section>
      </div>
    </div>
  );
}
