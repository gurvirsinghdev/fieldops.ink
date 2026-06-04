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
import {
  CopyIcon,
  Loader2Icon,
  MailIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

interface Props {
  members: Member[];
  invitations: Invitation[];
  currentRole: string;
  currentUserId: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MembersPageClient({
  members,
  invitations,
  currentRole,
  currentUserId,
}: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const canInvite = currentRole === "Owner" || currentRole === "Admin";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to send invitation");
        return;
      }

      setInviteLink(data.link);
      toast.success("Invitation created");
      setEmail("");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setInviting(false);
    }
  }

  function copyLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Link copied to clipboard");
    }
  }

  async function handleRevoke(invitationId: string, email: string) {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to revoke invitation");
        return;
      }

      toast.success(`Invitation to ${email} revoked`);
    } catch {
      toast.error("Something went wrong.");
    }
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
            <h2 className="font-semibold">
              Invite members
            </h2>
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
                    disabled={inviting}
                  >
                    {inviting ? (
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
                        onClick={() => handleRevoke(inv.id, inv.email)}
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
