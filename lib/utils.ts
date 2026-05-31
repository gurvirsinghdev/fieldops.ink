import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildBaseRoute(path: string) {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST!;
  const appPort = appHost === "localhost" ? ":3000" : "";
  const scheme = appHost === "localhost" ? "http" : "https";

  const url = `${scheme}://${appHost}${appPort}${path}`;
  console.log(url);
  return url;
}

export function buildWorkspaceRoute(workspaceSlug: string) {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST!;
  const appPort = appHost === "localhost" ? ":3000" : "";
  const scheme = appHost === "localhost" ? "http" : "https";

  const url = `${scheme}://${workspaceSlug}.${appHost}${appPort}/`;
  console.log(url);
  return url;
}
