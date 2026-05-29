import Link from "next/link";
import { getServerSession } from "@/lib/auth.actions";
import { redirect } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: Props) {
  const session = await getServerSession();
  const user = session?.user;

  if (!!user) {
    redirect("/dashboard");
  }

  return (
    <main className="w-screen h-screen flex flex-col">
      <header className="border-b p-4">
        <div className="container">
          <Link
            href={"/"}
            className="text-primary underline-offset-2 underline decoration-primary/50 hover:decoration-primary"
          >
            FieldOps
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t p-4">
        <div className="container flex items-center justify-between gap-4">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} FieldOps. All rights reserved.
          </p>

          <nav className="flex items-center gap-2">
            <Link
              href={"/privacy-policy"}
              className="text-primary underline-offset-2 underline decoration-primary/50 hover:decoration-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href={"/terms-and-conditions"}
              className="text-primary underline-offset-2 underline decoration-primary/50 hover:decoration-primary"
            >
              Terms {"&"} Conditions
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
