"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  token: string;
  onUploaded: (urls: string[]) => void;
}

export function ImageUploader({ token, onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setLoading(true);
      setError(null);
      const uploaded: string[] = [];
      try {
        for (const file of Array.from(files)) {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch("/api/uploads", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          });
          if (!res.ok) {
            throw new Error("No se pudo subir la imagen");
          }
          const data = (await res.json()) as { url: string };
          uploaded.push(data.url);
        }
        onUploaded(uploaded);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de carga");
      } finally {
        setLoading(false);
      }
    },
    [onUploaded, token],
  );

  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm text-slate-600">
        Arrastrá y soltá imágenes aquí o
        <button
          type="button"
          className="ml-1 text-primary underline"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          seleccioná archivos
        </button>
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void uploadFiles(event.target.files)}
      />
      <div
        className="mt-4 rounded-lg bg-white p-4 text-xs text-slate-500"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        {loading ? "Subiendo imágenes..." : "Formatos admitidos: JPG, PNG. Máx 5MB."}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
