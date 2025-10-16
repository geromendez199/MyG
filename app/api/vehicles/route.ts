import { NextResponse } from "next/server";

import { fetchVehicles } from "@/lib/vehicle-repository";
import { config } from "@/lib/config";
import { slugify } from "@/lib/slug";
import { vehicleFiltersSchema, vehicleInputSchema } from "@/lib/validators";
import { getDb } from "@/lib/db";
import { fallback as isFallbackMode, flags } from "@/lib/env";

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

  const result = await fetchVehicles(filters, { includeDrafts });

  return NextResponse.json({
    items: result.items,
    pagination: {
      page: result.page,
      perPage: result.perPage,
      total: result.total,
      totalPages: result.totalPages,
    },
    fallback: result.fallback,
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (isFallbackMode || !flags.hasDB) {
    return NextResponse.json(
      {
        error: "Demo mode: sin conexión a base de datos",
      },
      { status: 403 },
    );
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

    const db = getDb();

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
