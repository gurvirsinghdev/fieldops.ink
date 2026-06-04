"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { buildBaseRoute } from "@/lib/utils";

const signUpSchema = z.object({
  name: z.string().min(3, {
    error: "Full name must be at least 3 characters long.",
  }),
  email: z.email({
    error: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    error: "Password must be at least 8 characters long.",
  }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams?.get("invite") ?? null;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const signUpHandler = async (data: SignUpValues) => {
    setIsLoading(true);
    const { error } = await authClient.signUp.email(data);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else if (inviteToken) {
      router.push(buildBaseRoute(`/invite/${inviteToken}`));
    } else {
      toast.success("Account created!");
      router.push(buildBaseRoute("/my-workspace"));
    }
  };

  return (
    <div className="container w-screen h-full grow flex items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            {inviteToken
              ? "Create your account to accept the workspace invitation."
              : "Please create your account to access your workspace."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(signUpHandler)}
          >
            <Field data-invalid={!!form.formState.errors.name}>
              <Label htmlFor="name">Name</Label>
              <Input
                {...form.register("name")}
                id="name"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.name}
                placeholder="Please enter your full name."
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>
            <Field data-invalid={!!form.formState.errors.email}>
              <Label htmlFor="email">Email</Label>
              <Input
                {...form.register("email")}
                id="email"
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.email}
                placeholder="Please enter your email address."
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <Field data-invalid={!!form.formState.errors.password}>
              <Label htmlFor="password">Password</Label>
              <Input
                {...form.register("password")}
                id="password"
                type="password"
                autoComplete="off"
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.password}
                placeholder="Enter a strong password for your account."
              />
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>

            <Button type="submit" className="w-full">
              {!isLoading ? (
                <span>Sign Up</span>
              ) : (
                <Loader2Icon className="animate-spin size-4" />
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <Link
            href={"/signin"}
            className="text-primary underline-offset-2 underline decoration-primary/50 hover:decoration-primary"
          >
            <span>Already have an account?</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
