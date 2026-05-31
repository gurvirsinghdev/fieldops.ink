interface Props {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspacePage({ params }: Props) {
  const { workspaceSlug } = await params;
  return <div>{workspaceSlug}</div>;
}
