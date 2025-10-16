"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useQueryUpdater } from "@/hooks/use-query-updater";

interface FiltersProps {
  className?: string;
}

const brands = ["Ford", "Chevrolet", "Toyota", "Volkswagen", "Renault", "Peugeot", "Fiat"];

export function Filters({ className = "" }: FiltersProps) {
  const params = useSearchParams();
  const { updateSearchParams, isPending } = useQueryUpdater();

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
    updateSearchParams((search) => {
      if (value) {
        search.set(key, value);
      } else {
        search.delete(key);
      }
      // Cada cambio reinicia la paginación para evitar páginas vacías.
      search.delete("page");
    });
  };

  const clearFilters = () => {
    updateSearchParams((search) => {
      const keepSearch = values.q.trim();
      // clear() no está disponible en todos los entornos, borramos manualmente.
      Array.from(search.keys()).forEach((key) => search.delete(key));
      if (keepSearch) {
        search.set("q", keepSearch);
      }
    });
  };

  return (
    // aria-busy avisa a lectores de pantalla que la búsqueda está recalculando resultados.
    <form className={`space-y-6 ${className}`} aria-busy={isPending}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-600" htmlFor="filter-search">
          Buscar por palabra clave
        </label>
        <input
          id="filter-search"
          type="search"
          enterKeyHint="search"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Marca, modelo o característica"
          defaultValue={values.q}
          onBlur={(event) => updateParam("q", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Aplicamos filtros inmediatamente al presionar Enter para mejorar la UX con teclado.
              updateParam("q", (event.currentTarget as HTMLInputElement).value);
            }
          }}
          aria-controls="inventario"
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
              inputMode="numeric"
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
              inputMode="numeric"
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
              inputMode="numeric"
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
              inputMode="numeric"
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
