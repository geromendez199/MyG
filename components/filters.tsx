"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

const brands = [
  "Ford",
  "Chevrolet",
  "Toyota",
  "Volkswagen",
  "Renault",
  "Peugeot",
  "Fiat",
];

export function Filters() {
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

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page");
    const query = newParams.toString();
    router.replace(query ? `?${query}` : "?");
  };

  return (
    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col text-sm font-medium text-slate-700">
        Búsqueda
        <input
          className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Marca, modelo, palabra clave"
          defaultValue={values.q}
          onBlur={(event) => updateParam("q", event.target.value)}
        />
      </label>
      <label className="flex flex-col text-sm font-medium text-slate-700">
        Marca
        <select
          className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
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
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col text-sm font-medium text-slate-700">
          Año desde
          <input
            type="number"
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            defaultValue={values.yearMin}
            onBlur={(event) => updateParam("yearMin", event.target.value)}
          />
        </label>
        <label className="flex flex-1 flex-col text-sm font-medium text-slate-700">
          Año hasta
          <input
            type="number"
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            defaultValue={values.yearMax}
            onBlur={(event) => updateParam("yearMax", event.target.value)}
          />
        </label>
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col text-sm font-medium text-slate-700">
          Precio min.
          <input
            type="number"
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            defaultValue={values.priceMin}
            onBlur={(event) => updateParam("priceMin", event.target.value)}
          />
        </label>
        <label className="flex flex-1 flex-col text-sm font-medium text-slate-700">
          Precio máx.
          <input
            type="number"
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            defaultValue={values.priceMax}
            onBlur={(event) => updateParam("priceMax", event.target.value)}
          />
        </label>
      </div>
    </form>
  );
}
