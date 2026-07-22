"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buildWorkspaceRoute } from "@/lib/urls";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckIcon,
  Loader2Icon,
  SaveIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const workspaceSchema = z.object({
  name: z.string().min(3, {
    error: "Workspace name must be at least 3 characters long.",
  }),
  slug: z
    .string()
    .min(3, { error: "Slug must be at least 3 characters long." })
    .regex(SLUG_PATTERN, {
      error:
        "Slug can only contain lowercase letters, numbers, and hyphens (not at start/end).",
    }),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type Props = {
  workspace: {
    name: string;
    slug: string;
  };
};

export function WorkspaceSettingsForm({ workspace }: Props) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [showLowercaseTooltip, setShowLowercaseTooltip] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lowercaseTooltipRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    values: {
      name: workspace.name,
      slug: workspace.slug,
    },
  });

  const currentSlug = form.watch("slug");
  const currentName = form.watch("name");

  const slugChanged = currentSlug !== workspace.slug;
  const nameChanged = currentName !== workspace.name;

  useEffect(() => {
    if (!slugChanged || !currentSlug) {
      setSlugStatus("idle");
      setSlugError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    setSlugStatus("checking");
    setSlugError(null);

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();

      try {
        const res = await fetch(
          `/api/workspace?checkSlug=${encodeURIComponent(currentSlug)}`,
          { signal: abortRef.current.signal },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setSlugError(body?.error ?? "Invalid slug");
          setSlugStatus("invalid");
          return;
        }

        const { available } = await res.json();
        setSlugStatus(available ? "available" : "taken");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSlugError("Could not verify slug availability.");
        setSlugStatus("invalid");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [currentSlug]);

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const lower = e.target.value.toLowerCase();
      if (lower !== e.target.value) {
        setShowLowercaseTooltip(true);
        if (lowercaseTooltipRef.current)
          clearTimeout(lowercaseTooltipRef.current);
        lowercaseTooltipRef.current = setTimeout(
          () => setShowLowercaseTooltip(false),
          2000,
        );
      }
      form.setValue("slug", lower, { shouldValidate: true });
    },
    [form],
  );

  const slugInputSuffix = (() => {
    if (!slugChanged) return null;
    switch (slugStatus) {
      case "checking":
        return <Loader2Icon className="size-4 animate-spin text-muted-foreground" />;
      case "available":
        return <CheckIcon className="size-4 text-green-600" />;
      case "taken":
      case "invalid":
        return <XIcon className="size-4 text-destructive" />;
      default:
        return null;
    }
  })();

  const canSave =
    (nameChanged || slugChanged) &&
    slugStatus !== "checking" &&
    slugStatus !== "taken" &&
    slugStatus !== "invalid" &&
    !isLoading &&
    form.formState.isValid;

  const onSubmit = async (data: WorkspaceValues) => {
    if (!canSave) return;

    setIsLoading(true);

    try {
      const body: Record<string, string> = {};
      if (nameChanged) body.name = data.name;
      if (slugChanged) body.slug = data.slug;

      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.error ?? "Could not update workspace.");
        return;
      }

      const { workspace: updated } = await res.json();
      useWorkspaceStore.getState().updateWorkspace(updated.name, updated.slug, updated.image);

      if (slugChanged) {
        toast.success("Workspace updated! Redirecting...");
        router.push(
          `${buildWorkspaceRoute(data.slug)}settings/workspace`,
        );
      } else {
        toast.success("Workspace updated!");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="py-0">
        <CardContent className="py-4">
          <div className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.name}>
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                {...form.register("name")}
                id="workspaceName"
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.name}
                placeholder="Please enter your workspace name."
              />
              <FieldError>
                {form.formState.errors.name?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.slug || slugStatus === "taken" || slugStatus === "invalid"}>
              <Label htmlFor="workspaceSlug">Workspace slug</Label>
              <Tooltip open={showLowercaseTooltip} onOpenChange={setShowLowercaseTooltip}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Input
                      {...form.register("slug")}
                      onChange={handleSlugChange}
                      id="workspaceSlug"
                      autoComplete="off"
                      spellCheck="false"
                      disabled={isLoading}
                      placeholder="your-workspace-slug"
                      className={cn(
                        slugStatus === "available" && "border-green-600 pr-8",
                        (slugStatus === "taken" || slugStatus === "invalid") && "border-destructive pr-8",
                        slugStatus === "checking" && "pr-8",
                      )}
                    />
                    {slugInputSuffix && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {slugInputSuffix}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Only lowercase letters are allowed.
                </TooltipContent>
              </Tooltip>
              {form.formState.errors.slug ? (
                <FieldError>
                  {form.formState.errors.slug.message}
                </FieldError>
              ) : (slugStatus === "taken" || slugStatus === "invalid") && slugError ? (
                <FieldError>{slugError}</FieldError>
              ) : null}
            </Field>
          </div>

          <div className="mt-4">
            <Button type="submit" disabled={!canSave}>
              {isLoading ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="mr-2 h-4 w-4" />
              )}
              Save workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
