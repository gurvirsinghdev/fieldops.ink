export function buildBaseRoute(path: string) {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST!;
  const appPort = appHost === "localhost" ? ":3000" : "";
  const scheme = appHost === "localhost" ? "http" : "https";

  const url = `${scheme}://${appHost}${appPort}${path}`;
  return url;
}

export function buildWorkspaceRoute(workspaceSlug: string) {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST!;
  const appPort = appHost === "localhost" ? ":3000" : "";
  const scheme = appHost === "localhost" ? "http" : "https";

  const url = `${scheme}://${workspaceSlug}.${appHost}${appPort}/`;
  return url;
}
