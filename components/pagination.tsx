"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const params = useSearchParams();

  const goTo = (newPage: number) => {
    const search = new URLSearchParams(params.toString());
    if (newPage <= 1) {
      search.delete("page");
    } else {
      search.set("page", String(newPage));
    }
    const query = search.toString();
    router.replace(query ? `?${query}` : "?");
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between gap-3 text-sm">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-slate-600">
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
