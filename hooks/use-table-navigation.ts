import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function useTableNavigation(initialQuery: string, initialPerPage: number) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const ownNavigation = useRef(false);

  useEffect(() => {
    if (!ownNavigation.current) {
      setSearch(initialQuery);
    }
    ownNavigation.current = false;
  }, [initialQuery]);

  const pushParams = useCallback(
    (overrides: Record<string, string | number>) => {
      const params = new URLSearchParams();
      const nextQuery = String(overrides.q ?? search);
      const nextPage = String(overrides.page ?? 1);
      const nextPerPage = String(overrides.perPage ?? initialPerPage);

      if (nextQuery) params.set("q", nextQuery);
      if (nextPage !== "1") params.set("page", nextPage);
      if (nextPerPage !== "20") params.set("perPage", nextPerPage);

      const qs = params.toString();
      ownNavigation.current = true;
      startTransition(() => {
        router.push(qs ? `?${qs}` : window.location.pathname);
      });
    },
    [router, search, initialPerPage],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushParams({ q: value, page: 1 });
      }, 300);
    },
    [pushParams],
  );

  const handlePerPage = useCallback(
    (value: string) => {
      pushParams({ perPage: Number(value), page: 1 });
    },
    [pushParams],
  );

  return {
    search,
    setSearch,
    isPending,
    pushParams,
    handleSearch,
    handlePerPage,
    ownNavigation,
  };
}
