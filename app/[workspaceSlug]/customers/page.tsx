import { CustomerTable } from "./_components/CustomerTable";
import { mockCustomers } from "./_components/mockData";

interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function CustomersPage({ params: _params }: Props) {
  await _params;

  return (
    <div>
      <CustomerTable customers={mockCustomers} />
    </div>
  );
}
