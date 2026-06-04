import { useQuery } from "@tanstack/react-query";

interface CustomerOption {
  id: string;
  name: string;
}

export function useCustomerSearch(query: string) {
  return useQuery({
    queryKey: ["customers", "search", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/customers?${params}`);
      return res.json() as Promise<CustomerOption[]>;
    },
    staleTime: 30 * 1000,
  });
}
