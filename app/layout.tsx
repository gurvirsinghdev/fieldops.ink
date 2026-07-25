import type { Metadata } from "next";
import { Antic, Noto_Sans_Georgian, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const mono = JetBrains_Mono();
const serif = Noto_Sans_Georgian();
const sans = Antic({ weight: "400" });

export const metadata: Metadata = {
  title: "FieldOps — Field Service Operations Platform",
  description:
    "Customer management, job tracking, asset inventory, route optimization, and QuickBooks integration for field service teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        sans.className,
        serif.className,
        mono.className,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          toastOptions={{
            classNames: {
              title: sans.className,
              description: sans.className,
            },
          }}
        />
      </body>
    </html>
  );
}
