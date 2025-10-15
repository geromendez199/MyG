import "server-only";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { formatCurrency, formatKm } from "@/lib/format";
import { waHref } from "@/lib/whatsapp";

interface PageProps {
  params: { slug: string };
}

type VehicleWithSeller = Prisma.VehicleGetPayload<{
  include: { seller: true };
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { slug: params.slug },
      include: { seller: true },
    });

    if (!vehicle) {
      return { title: "Vehículo no encontrado" };
    }

    const title = `${vehicle.title} ${vehicle.year} | MG Automotores`;
    const description = vehicle.description || config.seo.description;
    const image = vehicle.images[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      },
    };
  } catch (error) {
    console.error("Failed to load vehicle metadata", error);
    return { title: "Vehículo no disponible" };
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  let vehicle: VehicleWithSeller | null = null;
  let hasError = false;

  try {
    vehicle = await db.vehicle.findUnique({
      where: { slug: params.slug },
      include: { seller: true },
    });
  } catch (error) {
    console.error("Failed to load vehicle detail", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
        <a href="/" className="text-sm text-slate-600">
          ← Volver al listado
        </a>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-red-700 shadow-sm">
          No pudimos cargar la información del vehículo. Revisá la conexión a la base de datos e intentá nuevamente.
        </div>
      </div>
    );
  }

  if (!vehicle) {
    notFound();
  }

  const cover = vehicle.images[0];
  const message = `Hola! Me interesa el ${vehicle.title} (${vehicle.year}). ¿Sigue disponible?`;

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12">
      <a href="/" className="text-sm text-slate-600">
        ← Volver al listado
      </a>
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {cover && (
          <div className="relative h-96 w-full overflow-hidden">
            <Image src={cover} alt={vehicle.title} fill className="object-cover" priority />
          </div>
        )}
        <div className="grid gap-10 p-8 md:grid-cols-[2fr_1fr]">
          <section className="space-y-6">
            <header className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {vehicle.brand}
              </span>
              <h1 className="text-3xl font-bold text-slate-900">{vehicle.title}</h1>
              <p className="text-lg font-semibold text-primary">{formatCurrency(vehicle.priceARS)}</p>
            </header>
            <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Año</dt>
                <dd>{vehicle.year}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Kilometraje</dt>
                <dd>{formatKm(vehicle.km)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Combustible</dt>
                <dd>{vehicle.fuel ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Transmisión</dt>
                <dd>{vehicle.gearbox ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Ubicación</dt>
                <dd>{vehicle.location ?? "-"}</dd>
              </div>
            </dl>
            {vehicle.description && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Descripción</h2>
                <p className="whitespace-pre-line text-sm text-slate-700">{vehicle.description}</p>
              </section>
            )}
            {vehicle.images.length > 1 && (
              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Galería</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {vehicle.images.slice(1).map((image) => (
                    <div key={image} className="relative h-40 overflow-hidden rounded-xl">
                      <Image src={image} alt={vehicle.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </section>
          <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Contactá al vendedor</h2>
            <p className="text-sm text-slate-600">
              {vehicle.seller.name}
              <br />
              {vehicle.seller.phoneE164}
            </p>
            <a
              href={waHref(vehicle.seller.phoneE164, message)}
              className="btn-primary text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar por WhatsApp
            </a>
          </aside>
        </div>
      </article>
    </div>
  );
}
