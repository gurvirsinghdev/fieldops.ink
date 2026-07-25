function Bar({ className }: { className?: string }) {
  return <div className={`bg-muted rounded animate-pulse ${className}`} />;
}

export function MembersPageSkeleton() {
  return (
    <section className="p-6">
      <div className="mb-6">
        <Bar className="h-4 w-80" />
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Bar className="h-5 w-36" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="min-w-0 space-y-1.5">
                  <Bar className="h-4 w-40" />
                  <Bar className="h-3 w-56" />
                </div>
                <Bar className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Bar className="h-5 w-32" />
            <Bar className="h-3 w-72 mt-1" />
          </div>
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Bar className="h-3 w-10" />
                <Bar className="h-8 w-full rounded-lg" />
              </div>
              <div className="w-32 space-y-1.5">
                <Bar className="h-3 w-8" />
                <Bar className="h-8 w-full rounded-lg" />
              </div>
            </div>
            <div className="mt-3">
              <Bar className="h-7 w-36 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Bar className="h-5 w-44" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="space-y-1.5">
                  <Bar className="h-4 w-52" />
                  <Bar className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Bar className="h-5 w-16 rounded-full" />
                  <Bar className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
