"use client";

import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(3, {
    error: "Full name must be at least 3 characters long.",
  }),
});

type ProfileValues = z.infer<typeof profileSchema>;

type Props = {
  user: {
    name: string;
    email: string;
  };
};

export function ProfileForm({ user }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const onSubmit = async (data: ProfileValues) => {
    setIsLoading(true);
    const { error } = await authClient.updateUser({ name: data.name });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        useUserStore.getState().hydrate({ ...currentUser, name: data.name });
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="py-0">
        <CardContent className="py-4">
          <div className="space-y-4">
            <Field data-invalid={!!form.formState.errors.name}>
              <Label htmlFor="name">Name</Label>
              <Input
                {...form.register("name")}
                id="name"
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.name}
                placeholder="Please enter your full name."
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

            <Field>
              <Label htmlFor="email">Email</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      disabled
                      placeholder="Please enter your email address."
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Your email is read-only and cannot be changed.
                </TooltipContent>
              </Tooltip>
            </Field>

            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SaveIcon className="mr-2 h-4 w-4" />
                )}
                Save profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
