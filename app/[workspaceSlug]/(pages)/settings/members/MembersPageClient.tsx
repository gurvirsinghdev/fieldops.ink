"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CopyIcon, Loader2Icon, MailIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MembersPageSkeleton } from "@/components/settings/MembersPageSkeleton";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MembersPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(trpc.workspace.members.queryOptions());

  const createInvitation = useMutation(
    trpc.invitation.create.mutationOptions({
      onSuccess: (data) => {
        setInviteLink(data.link);
        toast.success("Invitation created");
        queryClient.invalidateQueries({
          queryKey: trpc.workspace.members.queryKey(),
        });
        router.refresh();
        setEmail("");
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to send invitation");
      },
    }),
  );

  const revokeInvitation = useMutation(
    trpc.invitation.revoke.mutationOptions({
      onSuccess: () => {
        toast.success("Invitation revoked");
        queryClient.invalidateQueries({
          queryKey: trpc.workspace.members.queryKey(),
        });
        router.refresh();
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to revoke invitation");
      },
    }),
  );

  if (isLoading) {
    return <MembersPageSkeleton />;
  }

  const members = data?.members ?? [];
  const invitations = data?.invitations ?? [];
  const currentRole = data?.currentRole ?? "Member";
  const currentUserId = data?.currentUserId ?? "";
  const canInvite = currentRole === "Owner" || currentRole === "Admin";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    createInvitation.mutate({
      email: email.trim(),
      role: role as "Member" | "Admin",
    });
  }

  function copyLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Link copied to clipboard");
    }
  }

  function handleRevoke(invitationId: string) {
    revokeInvitation.mutate({ id: invitationId });
  }

  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Manage workspace members and send invitations.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Members ({members.length})</h2>
          </div>
          <div className="divide-y">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {member.user.name}
                    {member.user.id === currentUserId && (
                      <span className="text-muted-foreground ml-1">(you)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <MailIcon className="size-3 shrink-0" />
                    {member.user.email}
                  </div>
                </div>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Invite members</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {canInvite
                ? "Send an invitation link to add someone to this workspace."
                : "Only owners and admins can invite new members."}
            </p>
          </div>
          <div className="p-4">
            {canInvite ? (
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32 space-y-1.5">
                    <Label htmlFor="invite-role">Role</Label>
                    <NativeSelect
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <NativeSelectOption value="Member">
                        Member
                      </NativeSelectOption>
                      {currentRole === "Owner" && (
                        <NativeSelectOption value="Admin">
                          Admin
                        </NativeSelectOption>
                      )}
                    </NativeSelect>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createInvitation.isPending}
                  >
                    {createInvitation.isPending ? (
                      <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <PlusIcon className="size-3.5 mr-1.5" />
                    )}
                    Create invite link
                  </Button>

                  {inviteLink && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyLink}
                    >
                      <CopyIcon className="size-3.5 mr-1.5" />
                      Copy link
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                Ask a workspace owner or admin to send an invitation.
              </p>
            )}
          </div>
        </div>

        {invitations.length > 0 && (
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <h2 className="font-semibold">
                Pending invitations ({invitations.length})
              </h2>
            </div>
            <div className="divide-y">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className={cn(
                    "flex items-center justify-between p-4",
                    new Date() > inv.expiresAt && "opacity-50",
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-sm">{inv.email}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date() > inv.expiresAt
                        ? "Expired"
                        : `Sent ${formatDate(inv.createdAt)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{inv.role}</Badge>
                    {new Date() <= inv.expiresAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRevoke(inv.id)}
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
