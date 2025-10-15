"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FiltersProps {
  className?: string;
}

const brands = ["Ford", "Chevrolet", "Toyota", "Volkswagen", "Renault", "Peugeot", "Fiat"];

const buildUrl = (query: string) => {
  const basePath = typeof window !== "undefined" ? window.location.pathname : "/";
  return query ? `?${query}` : basePath;
};

export function Filters({ className = "" }: FiltersProps) {
  const params = useSearchParams();
  const router = useRouter();

  const values = useMemo(
    () => ({
      q: params.get("q") ?? "",
      brand: params.get("brand") ?? "",
      yearMin: params.get("yearMin") ?? "",
      yearMax: params.get("yearMax") ?? "",
      priceMin: params.get("priceMin") ?? "",
      priceMax: params.get("priceMax") ?? "",
    }),
    [params],
  );

  const hasActiveFilters = useMemo(
    () => Object.entries(values).some(([key, value]) => (key === "q" ? Boolean(value.trim()) : Boolean(value))),
    [values],
  );

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page");
    const query = newParams.toString();
    router.replace(buildUrl(query));
  };

  const clearFilters = () => {
    const keepSearch = values.q.trim();
    const newParams = new URLSearchParams();
    if (keepSearch) {
      newParams.set("q", keepSearch);
    }
    router.replace(buildUrl(newParams.toString()));
  };

  return (
    <form className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-600" htmlFor="filter-search">
          Buscar por palabra clave
        </label>
        <input
          id="filter-search"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Marca, modelo o característica"
          defaultValue={values.q}
          onBlur={(event) => updateParam("q", event.target.value)}
        />
        <p className="text-xs text-slate-400">
          Escribí el modelo, versión o detalle que te interese. Actualizamos el listado automáticamente.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Marca</span>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-primary/80">
              Limpiar filtros
            </button>
          )}
        </div>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          defaultValue={values.brand}
          onChange={(event) => updateParam("brand", event.target.value)}
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <span className="text-sm font-semibold text-slate-600">Año</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-xs text-slate-500">
            <span>Desde</span>
            <input
              type="number"
              min={1900}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              defaultValue={values.yearMin}
              onBlur={(event) => updateParam("yearMin", event.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs text-slate-500">
            <span>Hasta</span>
            <input
              type="number"
              min={1900}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              defaultValue={values.yearMax}
              onBlur={(event) => updateParam("yearMax", event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-sm font-semibold text-slate-600">Precio</span>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-xs text-slate-500">
            <span>Mínimo</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              defaultValue={values.priceMin}
              onBlur={(event) => updateParam("priceMin", event.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs text-slate-500">
            <span>Máximo</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              defaultValue={values.priceMax}
              onBlur={(event) => updateParam("priceMax", event.target.value)}
            />
          </label>
        </div>
      </div>
    </form>
  );
}
