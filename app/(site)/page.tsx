import "server-only";
import { Suspense, cache } from "react";

import { Hero } from "@/components/hero";
import { Filters } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { VehicleCard } from "@/components/vehicle-card";
import { config } from "@/lib/config";
import { fetchActiveSellers, fetchVehicles } from "@/lib/vehicle-repository";
import { vehicleFiltersSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// cache() reutiliza el resultado entre metadata y contenido cuando la request comparte searchParams.
const getVehicles = cache(async function getVehicles(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const normalized = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  const parsed = vehicleFiltersSchema.safeParse(normalized);
  const filters = parsed.success ? parsed.data : vehicleFiltersSchema.parse({});
  // Al cachear evitamos recalcular la misma combinación de filtros dentro del render del servidor.
  return fetchVehicles(filters);
});

const getActiveSellers = cache(fetchActiveSellers);

async function VehiclesSection({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { items, page, totalPages, total, fallback } = await getVehicles(searchParams);

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
        {fallback ? (
          <div
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            role="status"
          >
            Estamos mostrando un catálogo de demostración mientras preparamos nuevas unidades. Escribinos por WhatsApp y te
            avisamos ni bien esté disponible el vehículo que buscás.
          </div>
        ) : null}
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
          <Suspense
            fallback={
              <div className="flex justify-center py-6 text-sm text-slate-500" role="status">
                Cargando paginación...
              </div>
            }
          >
            <Pagination page={page} totalPages={totalPages} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

export default async function SitePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { sellers } = await getActiveSellers();
  const ownerPhone = config.contacts.ownerPhone;
  const ownerName = config.contacts.ownerName;
  const phoneHref = ownerPhone ? `https://wa.me/${ownerPhone.replace(/[^0-9]/g, "")}` : undefined;
  const sellerNames = sellers.map((seller) => seller.name).filter(Boolean);
  // ListFormat genera textos naturales ("Martin y Gerónimo") sin hardcodear conjunciones.
  const sellerListFormatter = new Intl.ListFormat("es", { style: "long", type: "conjunction" });
  const sellerNamesLabel = sellerNames.length ? sellerListFormatter.format(sellerNames) : ownerName;

  return (
    <div className="space-y-16">
      <div className="mx-auto w-full max-w-6xl px-4 pt-12">
        <Hero sellers={sellers} />
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
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">¿Querés vender tu auto?</h3>
              <p className="mt-2 text-sm text-slate-600">
                {sellerNames.length > 0 ? (
                  <>Contactá a {sellerNamesLabel} y nosotros cargamos la publicación en Supabase por vos.</>
                ) : (
                  <>Hablá con nuestro equipo comercial y gestionamos la publicación en tu nombre.</>
                )}
              </p>
              {phoneHref ? (
                <a className="btn-secondary mt-4 w-full" href={phoneHref} target="_blank" rel="noopener noreferrer">
                  Escribir a {ownerName}
                </a>
              ) : null}
              <p className="mt-4 text-xs text-slate-400">
                {/* Este texto aclara la operatoria interna para el cliente final. */}
                Coordinamos todo el proceso para que tus datos se publiquen con seguridad y sin errores.
              </p>
            </div>
          </aside>
          <VehiclesSection searchParams={searchParams} />
        </section>
      </div>
    </div>
  );
}
