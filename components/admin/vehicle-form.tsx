"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { ImageUploader } from "./image-uploader";

interface Seller {
  id: string;
  name: string;
  phoneE164: string;
}

export interface AdminVehicle {
  id?: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  priceARS?: number | null;
  km?: number | null;
  fuel?: string | null;
  gearbox?: string | null;
  location?: string | null;
  description?: string | null;
  images: string[];
  sellerId: string;
  published: boolean;
}

const fetcher = (url: string, token: string) =>
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error("Error de carga");
    return res.json();
  });

interface VehicleFormProps {
  token: string;
  vehicle?: AdminVehicle;
  onSaved?: () => void;
  fallback?: boolean;
}

const createEmptyVehicle = (): AdminVehicle => ({
  title: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  priceARS: undefined,
  km: undefined,
  fuel: "",
  gearbox: "",
  location: "",
  description: "",
  images: [],
  sellerId: "",
  published: true,
});

export function VehicleForm({ token, vehicle, onSaved, fallback = false }: VehicleFormProps) {
  const [form, setForm] = useState<AdminVehicle>(vehicle ? { ...vehicle } : createEmptyVehicle());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setForm(vehicle ? { ...vehicle } : createEmptyVehicle());
  }, [vehicle]);

  const { data: sellers } = useSWR<{ sellers: Seller[] }>(
    token ? ["/api/admin/sellers", token] : null,
    (args: [string, string]) => fetcher(args[0], args[1]),
  );

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  useEffect(() => {
    if (!isEditing && sellers?.sellers?.length && !form.sellerId) {
      setForm((prev) => ({ ...prev, sellerId: sellers.sellers[0].id }));
    }
  }, [form.sellerId, isEditing, sellers]);

  const handleChange = (field: keyof AdminVehicle, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field: keyof AdminVehicle, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value ? Number(value) : undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fallback) {
      setError(
        "La base de datos no está disponible en este momento. Coordiná con el equipo para reintentar cuando Supabase esté online.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        priceARS: form.priceARS ?? undefined,
        km: form.km ?? undefined,
        fuel: form.fuel || undefined,
        gearbox: form.gearbox || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
      };
      const url = form.id ? `/api/vehicles/${form.id}` : "/api/vehicles";
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const message = await res.text();
        let reason = "Error al guardar";
        try {
          const parsed = JSON.parse(message) as { error?: string; errors?: { formErrors?: string[] } };
          if (parsed.error) {
            reason = parsed.error;
          } else if (parsed.errors?.formErrors?.length) {
            reason = parsed.errors.formErrors.join(". ");
          }
        } catch {
          if (message) {
            reason = message;
          }
        }
        throw new Error(reason);
      }
      setSuccess("Vehículo guardado correctamente");
      onSaved?.();
      if (!form.id) {
        setForm(createEmptyVehicle());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {fallback && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No hay conexión activa con la base de datos. Las ediciones se deshabilitan para evitar errores. Volvé a intentarlo cuando
          Supabase esté disponible.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Título
          <input
            required
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Marca
          <input
            required
            value={form.brand}
            onChange={(event) => handleChange("brand", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Modelo
          <input
            required
            value={form.model}
            onChange={(event) => handleChange("model", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Año
          <input
            type="number"
            required
            value={form.year ?? ""}
            onChange={(event) => handleNumberChange("year", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Precio (ARS)
          <input
            type="number"
            value={form.priceARS ?? ""}
            onChange={(event) => handleNumberChange("priceARS", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Kilometraje
          <input
            type="number"
            value={form.km ?? ""}
            onChange={(event) => handleNumberChange("km", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Combustible
          <input
            value={form.fuel ?? ""}
            onChange={(event) => handleChange("fuel", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Transmisión
          <input
            value={form.gearbox ?? ""}
            onChange={(event) => handleChange("gearbox", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700 md:col-span-2">
          Ubicación
          <input
            value={form.location ?? ""}
            onChange={(event) => handleChange("location", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700 md:col-span-2">
          Descripción
          <textarea
            value={form.description ?? ""}
            onChange={(event) => handleChange("description", event.target.value)}
            rows={4}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-slate-700 md:col-span-2">
          Vendedor
          <select
            required
            value={form.sellerId}
            onChange={(event) => handleChange("sellerId", event.target.value)}
            className="mt-1 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            disabled={fallback}
          >
            <option value="">Seleccionar vendedor</option>
            {sellers?.sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name} — {seller.phoneE164}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <span className="text-sm font-medium text-slate-700">Imágenes</span>
        <div className="mt-2 grid gap-3">
          <ImageUploader
            token={token}
            onUploaded={(urls) =>
              setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
            }
            disabled={fallback}
          />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {form.images.map((image) => (
              <li key={image} className="group relative overflow-hidden rounded-lg border border-slate-200">
                <Image src={image} alt="Imagen" width={200} height={112} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.filter((img) => img !== image),
                    }))
                  }
                  disabled={fallback}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, published: event.target.checked }))
          }
          disabled={fallback}
        />
        Publicar este vehículo
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setForm(vehicle ? { ...vehicle } : createEmptyVehicle())}
          disabled={loading || fallback}
        >
          Restablecer
        </button>
        <button type="submit" className="btn-primary" disabled={loading || fallback}>
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear vehículo"}
        </button>
      </div>
    </form>
  );
}
