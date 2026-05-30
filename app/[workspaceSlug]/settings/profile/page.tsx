import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "@/components/workspace/UserAvatar";
import { getServerSession } from "@/lib/auth.actions";
import prisma from "@/lib/prisma";
import { ImageIcon, SaveIcon } from "lucide-react";
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
        <Card className="py-0">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3">
              <UserAvatar size="lg" />

              <div className="flex flex-col items-center gap-1">
                <Button variant="outline" size="sm">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Change image
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 400×400.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="py-4">
            <div className="space-y-4">
              <Field className="gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={user.name}
                  placeholder="Please enter your full name."
                />
              </Field>

              <Field className="gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  placeholder="Please enter your email address."
                />
              </Field>

              <div>
                <Button>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        href={`https://${m.workspace.slug}.${process.env.APP_HOST}`}
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
