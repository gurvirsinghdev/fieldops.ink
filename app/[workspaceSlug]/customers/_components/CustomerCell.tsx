import type { Customer } from "./mockData";

interface Props {
  customer: Customer;
}

export function CustomerCell({ customer }: Props) {
  const location = [customer.city, customer.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-w-0">
      <div className="text-sm font-semibold truncate">{customer.name}</div>
      <div className="text-xs text-muted-foreground truncate">
        {customer.type}
        {location && <span className="text-border mx-1">|</span>}
        {location}
      </div>
    </div>
  );
}
