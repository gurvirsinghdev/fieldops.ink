interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceDashboard({ params }: Props) {
  const { workspaceSlug } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Welcome to {workspaceSlug}. Use the sidebar to navigate.
      </p>
    </div>
  );
}
