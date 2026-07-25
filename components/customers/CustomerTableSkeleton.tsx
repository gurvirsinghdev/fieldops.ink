import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = 20;

function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export function CustomerTableSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
        <Bar className="h-7 w-64 rounded-lg" />
        <Bar className="h-7 w-32 rounded-lg" />
        <Bar className="h-7 w-28 rounded-lg" />
        <div className="ml-auto">
          <Bar className="h-4 w-24" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <Bar className="h-3 w-16" />
              </TableHead>
              <TableHead className="w-40">
                <Bar className="h-3 w-12" />
              </TableHead>
              <TableHead className="w-60">
                <Bar className="h-3 w-10" />
              </TableHead>
              <TableHead className="flex justify-end items-center">
                <Bar className="h-3 w-14" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                <td className="p-2">
                  <Bar className="h-4 w-48" />
                </td>
                <td className="p-2">
                  <Bar className="h-4 w-28" />
                </td>
                <td className="p-2">
                  <Bar className="h-4 w-40" />
                </td>
                <td className="p-2 flex justify-end">
                  <Bar className="h-6 w-16 rounded-lg" />
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-[7.5] border-t">
        <div className="flex items-center gap-2 w-full">
          <Bar className="h-7 w-16 rounded-lg" />
          <Bar className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Bar className="h-7 w-20 rounded-lg" />
          <Bar className="h-3 w-24" />
          <Bar className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
