interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceDashboard({ params }: Props) {
  const { workspaceSlug } = await params;
  return <div className="p-4">{workspaceSlug}</div>;
}
