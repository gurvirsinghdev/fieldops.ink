"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CustomerOption {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (customerId: string) => void;
}

export function CustomerSelect({ value, onChange }: Props) {
  const [items, setItems] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cache = useRef<Map<string, CustomerOption[]>>(new Map());

  const fetchItems = useCallback(async (q: string) => {
    const cached = cache.current.get(q);
    if (cached) {
      setItems(cached);
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
        cache.current.set(q, data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleFocus() {
    setOpen(true);
    setLoading(true);
    fetchItems("");
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchItems(val), 250);
  }

  function handleSelect(customer: CustomerOption) {
    onChange(customer.id);
    setQuery(customer.name);
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInput}
          onFocus={handleFocus}
          placeholder="Search customers..."
          className="pr-8"
        />
        <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md">
          <div className="max-h-60 overflow-auto p-1">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No customers found
              </div>
            )}
            {!loading &&
              items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    c.id === value && "bg-accent",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(c);
                  }}
                >
                  {c.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
