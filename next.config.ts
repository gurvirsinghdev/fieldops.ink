import type { NextConfig } from "next";

const appHost = process.env.NEXT_PUBLIC_APP_HOST!;

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [appHost, `*.${appHost}`],

  rewrites: async () => ({
    beforeFiles: [
      {
        source:
          "/:path((?!_next|_static|_vercel|\\.well-known|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot|map|json|txt|xml|pdf)$).*)",
        has: [
          {
            type: "host",
            value: `(?<workspaceId>.+)\\.${appHost.replace(/\./g, "\\.")}`,
          },
        ],
        destination: "/:workspaceId/:path*",
      },
      {
        source:
          "/:path((?!_next|_static|_vercel|\\.well-known|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot|map|json|txt|xml|pdf)$).*)",
        has: [
          {
            type: "host",
            value: appHost.replace(/\./g, "\\."),
          },
        ],
        destination: "/base/:path*",
      },
    ],
  }),
};

export default nextConfig;
