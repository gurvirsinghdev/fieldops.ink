"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/workspace/UserAvatar";
import { ImageUploadDialog } from "@/components/workspace/ImageUploadDialog";
import { useUserStore } from "@/stores/user-store";
import { ImageIcon } from "lucide-react";

export function ProfileImageCard() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="py-0">
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar size="lg" />

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
        title="Change profile image"
        description="Choose an image from your device. Supported formats: PNG, JPEG, WebP, GIF. Max 2MB."
        uploadEndpoint="/api/profile/image"
        imageShapeClass="rounded-full"
        onSuccess={(data) => {
          useUserStore.getState().hydrate(data as { id: string; name: string; email: string; image?: string | null });
        }}
      />
    </>
  );
}
