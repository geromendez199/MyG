import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { slugify } from "@/lib/slug";
import { vehicleFiltersSchema, vehicleInputSchema } from "@/lib/validators";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!config.adminToken) return false;
  return authHeader === `Bearer ${config.adminToken}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeDrafts =
    searchParams.get("includeDrafts") === "true" && isAuthorized(request);
  const params = Object.fromEntries(searchParams.entries());
  const parsed = vehicleFiltersSchema.safeParse(params);
  const filters = parsed.success ? parsed.data : vehicleFiltersSchema.parse({});

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

    return NextResponse.json({
      items,
      pagination: {
        page: filters.page,
        perPage: filters.perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.perPage)),
      },
    });
  } catch (error) {
    console.error("Failed to fetch vehicles", error);
    return NextResponse.json(
      { error: "Error interno al obtener los vehículos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const parsed = vehicleInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const baseSlug = slugify(data.brand, data.model, data.year);
    let slug = baseSlug;
    let counter = 1;

    while (await db.vehicle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const created = await db.vehicle.create({
      data: {
        slug,
        title: data.title,
        brand: data.brand,
        model: data.model,
        year: data.year,
        priceARS: data.priceARS || null,
        km: data.km || null,
        fuel: data.fuel || null,
        gearbox: data.gearbox || null,
        location: data.location || null,
        description: data.description || null,
        images: data.images,
        sellerId: data.sellerId,
        published: data.published,
      },
      include: { seller: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle", error);
    return NextResponse.json(
      { error: "Error interno al crear el vehículo" },
      { status: 500 },
    );
  }
}
