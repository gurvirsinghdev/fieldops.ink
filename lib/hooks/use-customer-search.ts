import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export function useCustomerSearch(query: string) {
  const trpc = useTRPC();
  return useQuery(trpc.customer.search.queryOptions({ q: query || undefined }));
}
