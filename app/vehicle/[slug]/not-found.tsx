export default function VehicleNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 text-center">
      {/* Página específica para mantener consistencia SEO cuando notFound() se dispara. */}
      <h1 className="text-2xl font-semibold text-slate-900">Vehículo no disponible</h1>
      <p className="text-sm text-slate-500">
        Es posible que la unidad haya sido dada de baja o que todavía sea parte del inventario de demostración.
      </p>
      <a href="/" className="btn-secondary">
        Volver al catálogo
      </a>
    </div>
  );
}
