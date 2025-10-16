import { config } from "@/lib/config";
import { formatPhoneDisplay } from "@/lib/format";
import type { SellerProfile } from "@/lib/types";
import { waHref } from "@/lib/whatsapp";

type ContactCard = {
  id: string;
  name: string;
  phoneE164: string;
  waPreset: string | null;
};

type HeroProps = {
  sellers: SellerProfile[];
};

export function Hero({ sellers }: HeroProps) {
  const phone = config.contacts.ownerPhone;
  const phoneHref = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}` : undefined;
  // Mostramos asesores reales para que el cliente identifique quién lo acompañará.
  const advisors = sellers.filter((seller) => seller.active && seller.phoneE164);
  const advisorNames = advisors.length
    ? advisors.map((seller) => seller.name).join(" y ")
    : config.contacts.ownerName;
  const advisorCards: ContactCard[] = advisors.map((seller) => ({
    id: seller.id,
    name: seller.name,
    phoneE164: seller.phoneE164,
    waPreset: seller.waPreset,
  }));

  const contactCards: ContactCard[] = advisorCards.length
    ? advisorCards
    : phone
      ? [{
          id: "owner-contact",
          name: config.contacts.ownerName,
          phoneE164: phone,
          waPreset: null,
        }]
      : [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white px-6 py-16 shadow-xl ring-1 ring-slate-100 md:px-10">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-secondary/50 blur-3xl" />
      <div className="relative grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            MG Automotores
          </span>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Encontrá el auto ideal, con asesoramiento directo del vendedor
          </h1>
          <p className="text-lg text-slate-600">
            Vehículos seleccionados, historial claro y contacto inmediato por WhatsApp. Nuestro equipo carga cada unidad de manera personalizada para ofrecerte información confiable.
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row">
            <a href="#inventario" className="btn-primary">
              Ver vehículos disponibles
            </a>
            {phoneHref && (
              <a href={phoneHref} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                Hablar con un asesor
              </a>
            )}
          </div>
          <dl className="grid gap-6 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-500">+50 vehículos publicados</dt>
              <dd>Stock actualizado cada semana para que no te pierdas ninguna oportunidad.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Financiación y toma de usados</dt>
              <dd>Coordinamos todo el papeleo y buscamos la mejor alternativa para vos.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Contacto directo</dt>
              <dd>Te conectamos con el vendedor para que negocies de manera simple y segura.</dd>
            </div>
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-0 -translate-x-6 translate-y-6 rounded-3xl bg-primary/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contactos directos</p>
            {contactCards.length ? (
              <ul className="mt-4 space-y-4 text-sm text-slate-600">
                {contactCards.map((contact) => {
                  const formattedPhone = formatPhoneDisplay(contact.phoneE164);
                  const href = waHref(contact.phoneE164, contact.waPreset ?? undefined);
                  return (
                    <li key={contact.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">WhatsApp</p>
                          <p className="text-sm font-medium text-slate-600">{formattedPhone || contact.phoneE164}</p>
                        </div>
                        <a
                          className="btn-secondary justify-center"
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Escribir por WhatsApp
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Nuestro equipo está actualizando el catálogo. Dejanos tu contacto y te escribimos a la brevedad.
              </p>
            )}
            <p className="mt-6 rounded-2xl bg-primary/5 px-4 py-3 text-xs text-slate-500">
              Coordinamos tasaciones, visitas y financiación para que vivas una experiencia sin preocupaciones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
