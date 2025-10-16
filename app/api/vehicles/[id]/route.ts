import { NextResponse } from "next/server";

import { fetchVehicleById } from "@/lib/vehicle-repository";
import { config } from "@/lib/config";
import { slugify } from "@/lib/slug";
import { vehicleInputSchema } from "@/lib/validators";
import { getDb } from "@/lib/db";
import { fallback as isFallbackMode, flags } from "@/lib/env";

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!config.adminToken) return false;
  return authHeader === `Bearer ${config.adminToken}`;
}

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const result = await fetchVehicleById(params.id);

  if (!result.vehicle) {
    return new NextResponse("Not found", { status: 404 });
  }

  const response = NextResponse.json(result.vehicle);
  if (result.fallback) {
    response.headers.set("x-data-source", "fallback");
  }
  return response;
}

export async function PATCH(request: Request, { params }: Params) {
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
  const parsed = vehicleInputSchema.safeParse({ ...json, id: params.id });

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const db = getDb();
    const current = await db.vehicle.findUnique({ where: { id: params.id } });
    if (!current) {
      return new NextResponse("Not found", { status: 404 });
    }

    let slug = current.slug;
    const slugSource = slugify(data.brand, data.model, data.year);
    if (slugSource && slugSource !== current.slug) {
      slug = slugSource;
      let counter = 1;
      while (
        await db.vehicle.findFirst({
          where: { slug, NOT: { id: params.id } },
        })
      ) {
        slug = `${slugSource}-${counter++}`;
      }
    }

    const updated = await db.vehicle.update({
      where: { id: params.id },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update vehicle", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
