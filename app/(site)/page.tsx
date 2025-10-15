import React from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { vehicleFiltersSchema } from "@/lib/validators";
import { Hero } from "@/components/hero";
import { Filters } from "@/components/filters";
import { VehicleCard } from "@/components/vehicle-card";
import { Pagination } from "@/components/pagination";

export const revalidate = 60;

async function getVehicles(searchParams: Record<string, string | string[] | undefined>) {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const parsed = vehicleFiltersSchema.safeParse(normalized);

  const filters = parsed.success ? parsed.data : vehicleFiltersSchema.parse({});

  const where: Prisma.VehicleWhereInput = {
    published: true,
  };

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
  };
}

async function VehiclesSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { items, page, totalPages } = await getVehicles(searchParams);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
        No encontramos vehículos con esos filtros. Probá ajustar la búsqueda o volvé más tarde.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" id="inventario">
        {items.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      <React.Suspense fallback={<div className="flex justify-center py-8"><span>Cargando paginación...</span></div>}>
        <Pagination page={page} totalPages={totalPages} />
      </React.Suspense>
    </div>
  );
}

export default function SitePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className="space-y-16 pb-24">
      <Hero />
      <section className="space-y-6">
        <React.Suspense fallback={<div className="flex justify-center py-8"><span>Cargando filtros...</span></div>}>
          <Filters />
        </React.Suspense>
        <VehiclesSection searchParams={searchParams} />
      </section>
      <section className="rounded-3xl bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">¿Por qué elegir MG Automotores?</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {["Autos seleccionados", "Gestión integral", "Financiación flexible"].map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Nuestro equipo revisa cada vehículo y acompaña todo el proceso para que tengas una experiencia segura y transparente.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
