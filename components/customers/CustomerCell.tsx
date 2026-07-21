import type { Customer } from "./types";

interface Props {
  customer: Customer;
}

export function CustomerCell({ customer }: Props) {
  return (
    <div className="text-sm font-semibold truncate">{customer.name}</div>
  );
}
