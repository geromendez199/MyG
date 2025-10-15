import Image from "next/image";
import Link from "next/link";
import { Vehicle, Seller } from "@prisma/client";
import { waHref } from "@/lib/whatsapp";
import { formatCurrency, formatKm } from "@/lib/format";
import { ChatBubbleLeftRightIcon, MapPinIcon } from "@heroicons/react/24/outline";

export type VehicleWithSeller = Vehicle & { seller: Seller };

type Props = {
  vehicle: VehicleWithSeller;
};

export function VehicleCard({ vehicle }: Props) {
  const cover = vehicle.images[0];
  const message = `Hola! Me interesa el ${vehicle.title} (${vehicle.year}). ¿Sigue disponible?`;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative h-56 w-full overflow-hidden bg-slate-200">
        {cover ? (
          <Image
            src={cover}
            alt={vehicle.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            Sin imagen
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
          {vehicle.year}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
          <p className="text-sm text-slate-500">{formatKm(vehicle.km)} · {vehicle.fuel ?? "-"}</p>
        </header>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <MapPinIcon className="h-4 w-4" />
          {vehicle.location ?? "Sin ubicación"}
        </p>
        <p className="text-2xl font-bold text-primary">{formatCurrency(vehicle.priceARS)}</p>
        {vehicle.description && (
          <p className="line-clamp-3 text-sm text-slate-600">{vehicle.description}</p>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Link
            href={`/vehicle/${vehicle.slug}`}
            className="btn-secondary text-center"
          >
            Ver detalles
          </Link>
          <Link
            href={waHref(vehicle.seller.phoneE164, message)}
            className="btn-primary text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" />
            Hablar por WhatsApp
          </Link>
        </div>
      </div>
    </article>
  );
}
