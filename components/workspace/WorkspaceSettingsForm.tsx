"use client";

import { useTRPC } from "@/lib/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon, SaveIcon } from "lucide-react";

type Props = {
  workspace: {
    name: string;
    slug: string;
  };
};

export function WorkspaceSettingsForm({ workspace }: Props) {
  const router = useRouter();
  const trpc = useTRPC();
  const [submitting, setSubmitting] = useState(false);

  const updateWorkspace = useMutation(
    trpc.workspace.update.mutationOptions({
      onSuccess: () => {
        toast.success("Workspace saved.");
        router.refresh();
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to save workspace.");
      },
    }),
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    updateWorkspace.mutate(
      {
        name: (data.get("name") as string)?.trim() || undefined,
      },
      { onSettled: () => setSubmitting(false) },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="name">Workspace name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={workspace.name}
          placeholder="My Company"
        />
      </div>

      <Button type="submit" disabled={submitting} className="cursor-pointer">
        {submitting ? (
          <Loader2Icon className="size-3.5 mr-1.5 animate-spin" />
        ) : (
          <SaveIcon className="size-3.5 mr-1.5" />
        )}
        Save
      </Button>
    </form>
  );
}
