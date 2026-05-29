import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["fieldops.ink", "*.fieldops.ink"],
};

export default nextConfig;
