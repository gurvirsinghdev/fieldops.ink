"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

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
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { buildBaseRoute } from "@/lib/urls";

const signInSchema = z.object({
  email: z.email({
    error: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    error: "Please enter your account password.",
  }),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInHandler = async (data: SignInValues) => {
    setIsLoading(true);
    const { error } = await authClient.signIn.email({
      ...data,
      rememberMe: true,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created!");
      router.push(buildBaseRoute("/my-workspace"));
    }
  };

  return (
    <div className="container w-screen h-full grow flex items-center justify-center">
      <Card className="w-full max-w-100">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(signInHandler)}
          >
            <Field data-invalid={!!form.formState.errors.email}>
              <Label htmlFor="email">Email</Label>
              <Input
                {...form.register("email")}
                id="email"
                autoFocus
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
                disabled={isLoading}
                aria-invalid={!!form.formState.errors.password}
                placeholder="Enter a strong password for your account."
              />
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>

            <Button type="submit" className="w-full">
              {!isLoading ? (
                <span>Sign In</span>
              ) : (
                <Loader2Icon className="animate-spin size-4" />
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Link
            href={"/signup"}
            className="text-primary underline-offset-2 underline decoration-primary/50 hover:decoration-primary"
          >
            <span>Create an account</span>
          </Link>
          <Link
            href={"/"}
            aria-disabled={true}
            onClick={(e) => e.preventDefault()}
            className="text-primary cursor-not-allowed underline-offset-2 underline decoration-primary/50"
          >
            <span>Forgot Password?</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
