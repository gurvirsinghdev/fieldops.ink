import { getServerSession } from "@/lib/auth.actions";
import { redirect } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default async function WorkspaceLayout({ children }: Props) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return redirect("/signin");
  }

  return <div>{children}</div>;
}
