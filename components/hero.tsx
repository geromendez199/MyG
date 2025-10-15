import { config } from "@/lib/config";

export function Hero() {
  const phone = config.contacts.ownerPhone;
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary px-6 py-16 text-white shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
        <span className="text-sm uppercase tracking-[0.35em] text-white/80">MG Automotores</span>
        <h1 className="text-4xl font-bold md:text-5xl">
          Encontrá el auto ideal, con asesoramiento directo del vendedor
        </h1>
        <p className="text-lg text-white/80">
          Vehículos seleccionados, historial claro y contacto inmediato por WhatsApp. Cargamos unidades nuevas todas las semanas.
        </p>
        <div className="mx-auto flex flex-col gap-3 sm:flex-row">
          <a href="#inventario" className="btn-primary">
            Ver vehículos disponibles
          </a>
          {phone && (
            <a href={`tel:${phone}`} className="btn-secondary">
            Llamar a MG Automotores
            </a>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <svg
          className="h-full w-full"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="100" fill="currentColor" />
          <circle cx="500" cy="200" r="140" fill="currentColor" />
          <circle cx="320" cy="520" r="120" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}
