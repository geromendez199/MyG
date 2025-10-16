import type { Prisma } from "@prisma/client";

import { getDb } from "@/lib/db";
import type { VehicleWithSeller } from "@/lib/types";
import type { VehicleFilters } from "@/lib/validators";
import { SAMPLE_VEHICLES } from "./sample-data";

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

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const db = getDb();
    const where = buildWhere(filters, includeDrafts);

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
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const db = getDb();
    const vehicle = await db.vehicle.findUnique({
      where: { slug },
      include: { seller: true },
    });

    return {
      vehicle: (vehicle ?? null) as VehicleWithSeller | null,
      fallback: false,
    };
  } catch (error) {
    console.warn(`Falling back to sample vehicle for slug "${slug}" due to database error`, error);
    const vehicle =
      SAMPLE_VEHICLES.find((item) => item.slug === slug && item.published) ?? null;

    return {
      vehicle,
      fallback: true,
    };
  }
}

export async function fetchVehicleById(id: string): Promise<SingleResult> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const db = getDb();
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: { seller: true },
    });

    return {
      vehicle: (vehicle ?? null) as VehicleWithSeller | null,
      fallback: false,
    };
  } catch (error) {
    console.warn(`Falling back to sample vehicle for id "${id}" due to database error`, error);
    const vehicle = SAMPLE_VEHICLES.find((item) => item.id === id) ?? null;

    return {
      vehicle,
      fallback: true,
    };
  }
}
