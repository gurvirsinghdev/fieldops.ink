import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SecurityPage() {
  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Reset or change your account password.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="space-y-5 py-4">
          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password."
              />
            </Field>

            <Field>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter a strong new password."
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button>Reset password</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
