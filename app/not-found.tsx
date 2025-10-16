export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      {/* Mensaje genérico para rutas públicas inexistentes manteniendo el branding. */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">No encontramos la página</h1>
        <p className="text-sm text-slate-500">
          Verificá la URL o volvé al catálogo para seguir explorando vehículos disponibles.
        </p>
      </div>
      <a href="/" className="btn-primary">
        Volver al inicio
      </a>
    </div>
  );
}
