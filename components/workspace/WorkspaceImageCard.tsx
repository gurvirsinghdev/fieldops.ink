"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceAvatar } from "@/components/workspace/WorkspaceAvatar";
import { ChangeWorkspaceImageDialog } from "@/components/workspace/ChangeWorkspaceImageDialog";
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
                Recommended size: 400×400.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangeWorkspaceImageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
