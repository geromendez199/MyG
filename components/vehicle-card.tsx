import Image from "next/image";
import Link from "next/link";
import { ChatBubbleLeftRightIcon, MapPinIcon } from "@heroicons/react/24/outline";

import type { VehicleWithSeller } from "@/lib/types";
import { formatCurrency, formatKm } from "@/lib/format";
import { waHref } from "@/lib/whatsapp";

type Props = {
  vehicle: VehicleWithSeller;
};

export function VehicleCard({ vehicle }: Props) {
  const cover = vehicle.images[0];
  const message = `Hola! Me interesa el ${vehicle.title} (${vehicle.year}). ¿Sigue disponible?`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-60 w-full overflow-hidden bg-slate-200">
        {cover ? (
          <Image
            src={cover}
            alt={vehicle.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">Sin imagen</div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow">
          {vehicle.year}
        </div>
        {vehicle.seller.name && (
          <div className="absolute bottom-4 left-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white shadow">
            {vehicle.seller.name}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <header className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">{vehicle.title}</h3>
          <p className="text-sm text-slate-500">
            {formatKm(vehicle.km)} · {vehicle.fuel ?? "-"}
          </p>
        </header>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <MapPinIcon className="h-4 w-4" />
          {vehicle.location ?? "Sin ubicación"}
        </p>
        <p className="text-2xl font-bold text-slate-900">{formatCurrency(vehicle.priceARS)}</p>
        {vehicle.description && (
          <p className="line-clamp-3 text-sm text-slate-600">{vehicle.description}</p>
        )}
        <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
          <Link
            href={`/vehicle/${vehicle.slug}`}
            prefetch={false}
            className="btn-secondary text-center"
          >
            Ver detalles
          </Link>
          <a
            href={waHref(vehicle.seller.phoneE164, message)}
            className="btn-primary text-center"
            target="_blank"
            rel="noopener noreferrer"
            // Ancla externa para evitar que Next intente prefetch cross-origin.
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Consultar
          </a>
        </div>
      </div>
    </article>
  );
}
