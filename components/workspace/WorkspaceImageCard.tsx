"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceAvatar } from "@/components/workspace/WorkspaceAvatar";
import { ImageUploadDialog } from "@/components/workspace/ImageUploadDialog";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ImageIcon } from "lucide-react";

export function WorkspaceImageCard() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="py-0">
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3">
            <WorkspaceAvatar size="lg" />

            <div className="flex flex-col items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Change image
              </Button>
              <p className="text-xs text-muted-foreground">
                Square image recommended.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Change workspace image"
        description="Choose an image from your device. Supported formats: PNG, JPEG, WebP, GIF. Max 2MB."
        uploadEndpoint="/api/workspace/image"
        imageShapeClass="rounded-lg"
        onSuccess={(data) => {
          const updated = (data as { workspace: { name: string; slug: string; image?: string | null } }).workspace;
          useWorkspaceStore.getState().updateWorkspace(updated.name, updated.slug, updated.image);
        }}
      />
    </>
  );
}
