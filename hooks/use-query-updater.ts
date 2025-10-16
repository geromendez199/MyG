"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Mantiene sincronizada la querystring con transiciones concurrentes para evitar saltos en UI
 * y reutilizar la lógica tanto en filtros como en paginación.
 */
export function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useCallback(
    (mutator: (search: URLSearchParams) => void) => {
      const search = new URLSearchParams(params.toString());
      mutator(search);
      const query = search.toString();

      // Usamos startTransition para no bloquear la UI cuando Next renderiza la página actualizada.
      startTransition(() => {
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      });
    },
    [params, pathname, router],
  );

  return { updateSearchParams, isPending };
}
