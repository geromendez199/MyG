import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { fallback as isFallbackMode, flags } from "@/lib/env";
import type { SellerProfile, VehicleWithSeller } from "@/lib/types";
import { vehicleFiltersSchema, type VehicleFilters } from "@/lib/validators";
import {
  SAMPLE_VEHICLES,
  SAMPLE_SELLERS,
  findSampleVehicleById,
  findSampleVehicleBySlug,
} from "./sample-data";

const EMPTY_FILTERS = Object.freeze(vehicleFiltersSchema.parse({})); // Defaults reutilizables para queries utilitarias.

interface QueryOptions {
  includeDrafts?: boolean;
}

interface QueryResult {
  items: VehicleWithSeller[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
  fallback: boolean;
}

interface SingleResult {
  vehicle: VehicleWithSeller | null;
  fallback: boolean;
}

function buildWhere(filters: VehicleFilters, includeDrafts: boolean): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = includeDrafts
    ? {}
    : {
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

  return where;
}

function matchesFilters(vehicle: VehicleWithSeller, filters: VehicleFilters, includeDrafts: boolean) {
  if (!includeDrafts && !vehicle.published) return false;
  if (filters.brand && vehicle.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;

  if (filters.q) {
    const term = filters.q.trim().toLowerCase();
    const text = `${vehicle.title} ${vehicle.brand} ${vehicle.model} ${vehicle.description ?? ""}`.toLowerCase();
    if (!text.includes(term)) return false;
  }

  if (filters.yearMin && vehicle.year < filters.yearMin) return false;
  if (filters.yearMax && vehicle.year > filters.yearMax) return false;

  if (filters.priceMin && (vehicle.priceARS ?? 0) < filters.priceMin) return false;
  if (filters.priceMax && (vehicle.priceARS ?? Number.MAX_SAFE_INTEGER) > filters.priceMax) return false;

  return true;
}

function applySampleFilters(filters: VehicleFilters, includeDrafts: boolean) {
  return SAMPLE_VEHICLES.filter((vehicle) => matchesFilters(vehicle, filters, includeDrafts));
}

export async function fetchVehicles(
  filters: VehicleFilters,
  options: QueryOptions = {},
): Promise<QueryResult> {
  const includeDrafts = options.includeDrafts ?? false;
  const skip = (filters.page - 1) * filters.perPage;
  const take = filters.perPage;

  // Cuando falta DATABASE_URL servimos los datos de demostración sin golpear Prisma.
  if (isFallbackMode || !flags.hasDB) {
    const filtered = applySampleFilters(filters, includeDrafts).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + take);

    return {
      items: paginated,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
      page: filters.page,
      perPage: filters.perPage,
      fallback: true,
    };
  }

  try {
    const where = buildWhere(filters, includeDrafts);

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: { seller: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      items: items as VehicleWithSeller[],
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
      page: filters.page,
      perPage: filters.perPage,
      fallback: false,
    };
  } catch (error) {
    console.warn("Falling back to sample vehicles due to database error", error);

    const filtered = applySampleFilters(filters, includeDrafts).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + take);

    return {
      items: paginated,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
      page: filters.page,
      perPage: filters.perPage,
      fallback: true,
    };
  }
}

export async function fetchVehicleBySlug(slug: string): Promise<SingleResult> {
  // Idem para búsquedas individuales: retornamos muestras sin generar excepciones.
  if (isFallbackMode || !flags.hasDB) {
    const sample = findSampleVehicleBySlug(slug);
    const vehicle = sample && sample.published ? sample : null;

    return {
      vehicle,
      fallback: true,
    };
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      include: { seller: true },
    });

    return {
      vehicle: (vehicle ?? null) as VehicleWithSeller | null,
      fallback: false,
    };
  } catch (error) {
    console.warn(`Falling back to sample vehicle for slug "${slug}" due to database error`, error);
    const sample = findSampleVehicleBySlug(slug);
    const vehicle = sample && sample.published ? sample : null;

    return {
      vehicle,
      fallback: true,
    };
  }
}

export async function fetchVehicleById(id: string): Promise<SingleResult> {
  if (isFallbackMode || !flags.hasDB) {
    const vehicle = findSampleVehicleById(id);

    return {
      vehicle,
      fallback: true,
    };
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { seller: true },
    });

    return {
      vehicle: (vehicle ?? null) as VehicleWithSeller | null,
      fallback: false,
    };
  } catch (error) {
    console.warn(`Falling back to sample vehicle for id "${id}" due to database error`, error);
    const vehicle = findSampleVehicleById(id);

    return {
      vehicle,
      fallback: true,
    };
  }
}

export async function fetchActiveSellers(): Promise<{ sellers: SellerProfile[]; fallback: boolean }> {
  if (isFallbackMode || !flags.hasDB) {
    // En demo devolvemos los vendedores conocidos para que el panel muestre contactos válidos.
    return { sellers: SAMPLE_SELLERS as SellerProfile[], fallback: true };
  }

  try {
    const sellers = await prisma.seller.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return { sellers: sellers as SellerProfile[], fallback: false };
  } catch (error) {
    console.warn("Falling back to sample sellers due to database error", error);
    return { sellers: SAMPLE_SELLERS as SellerProfile[], fallback: true };
  }
}

export async function fetchAllVehicles(options: QueryOptions = {}) {
  // Generamos listados completos (sitemap / feeds) sin repetir queries según cantidad de páginas.
  const includeDrafts = options.includeDrafts ?? false;

  if (isFallbackMode || !flags.hasDB) {
    // Los listados globales (sitemap/feed) también salen del dataset de demo en modo fallback.
    const vehicles = includeDrafts
      ? [...SAMPLE_VEHICLES]
      : SAMPLE_VEHICLES.filter((vehicle) => vehicle.published);

    return { vehicles, fallback: true };
  }

  try {
    const where = buildWhere(EMPTY_FILTERS, includeDrafts);
    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { seller: true },
      orderBy: { updatedAt: "desc" },
    });

    return { vehicles: vehicles as VehicleWithSeller[], fallback: false };
  } catch (error) {
    console.warn("Falling back to sample vehicles for sitemap", error);
    const vehicles = includeDrafts
      ? [...SAMPLE_VEHICLES]
      : SAMPLE_VEHICLES.filter((vehicle) => vehicle.published);
    return { vehicles, fallback: true };
  }
}
