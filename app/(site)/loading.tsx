export default function LandingLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12">
      {/* Skeleton general para mantener layout estable durante cargas lentas. */}
      <div className="h-64 animate-pulse rounded-3xl bg-white/80 shadow" />
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-3xl bg-white/80 shadow" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-3xl bg-white/80 shadow" />
          ))}
        </div>
      </div>
    </div>
  );
}
