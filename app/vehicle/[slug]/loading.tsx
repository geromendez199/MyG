export default function VehicleLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      {/* Skeleton suave para evitar flash en navegación entre fichas. */}
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
      <div className="h-64 w-full animate-pulse rounded-3xl bg-slate-200" />
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
