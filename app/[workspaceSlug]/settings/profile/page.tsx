import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProfileForm } from "@/components/workspace/ProfileForm";
import { ProfileImageCard } from "@/components/workspace/ProfileImageCard";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession();
  const user = session!.user;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      role: true,
      workspace: {
        select: {
          name: true,
          slug: true,
          plan: true,
        },
      },
    },
  });

  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Update your personal account information.
        </p>
      </div>

      <div className="space-y-6">
        <ProfileImageCard />

        <ProfileForm user={{ name: user.name, email: user.email }} />

        <Card className="py-0">
          <CardContent className="py-4">
            <div className="mb-4">
              <h2 className="font-semibold">Workspace memberships</h2>
              <p className="text-sm text-muted-foreground">
                The workspaces you currently belong to.
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link
                        href={`https://${m.workspace.slug}.${process.env.NEXT_PUBLIC_APP_HOST}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {m.workspace.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.workspace.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {m.role}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
