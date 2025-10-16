"use client";

import { useQueryUpdater } from "@/hooks/use-query-updater";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const { updateSearchParams } = useQueryUpdater();

  const goTo = (newPage: number) => {
    // Aseguramos que el paginador nunca navegue fuera del rango válido.
    const target = Math.min(Math.max(newPage, 1), totalPages);

    updateSearchParams((search) => {
      if (target <= 1) {
        search.delete("page");
      } else {
        search.set("page", String(target));
      }
    });
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-between gap-3 text-sm"
      aria-label="Paginación de resultados"
    >
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-slate-600" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </nav>
  );
}
