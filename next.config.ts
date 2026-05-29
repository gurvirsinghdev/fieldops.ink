import type { NextConfig } from "next";

const appHost = process.env.APP_HOST!;

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [appHost, `*.${appHost}`],

  rewrites: async () => ({
    beforeFiles: [
      {
        source: "/:path((?!_next|_static|_vercel|.well-known|.*\\.\\w+$).*)*",
        has: [{ type: "host", value: `(?<workspaceId>.*).${appHost}` }],
        destination: "/:workspaceId/:path*",
      },
      {
        source: "/:path((?!_next|_static|_vercel|.well-known|.*\\.\\w+$).*)*",
        has: [{ type: "host", value: appHost }],
        destination: "/base/:path*",
      },
    ],
  }),
};

export default nextConfig;
