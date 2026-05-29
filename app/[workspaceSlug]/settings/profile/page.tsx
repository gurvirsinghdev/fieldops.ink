import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getServerSession } from "@/lib/auth.actions";
import { ImageIcon, SaveIcon } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession();
  const user = session!.user;

  const userInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <section className="p-6">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Update your personal account information.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="space-y-6 py-4">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>{userInitials()}</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <ImageIcon className="mr-2 h-4 w-4" />
                Change image
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, or WEBP. Recommended size: 400×400.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                defaultValue="Gurvir Singh"
                placeholder="Please enter your full name."
              />
            </Field>

            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="gurvir@example.com"
                placeholder="Please enter your email address."
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
