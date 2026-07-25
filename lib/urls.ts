function getRouteEssentials() {
  const appHost = process.env.NEXT_PUBLIC_APP_HOST!;
  const appPort = appHost === "localhost" ? ":3000" : "";
  const scheme = appHost === "localhost" ? "http" : "https";

  return { appHost, appPort, scheme };
}

export function buildBaseRoute(path: string) {
  const { appHost, appPort, scheme } = getRouteEssentials();
  return `${scheme}://${appHost}${appPort}${path}`;
}

export function buildWorkspaceRoute(workspaceSlug: string, path: string = "/") {
  const { appHost, appPort, scheme } = getRouteEssentials();
  return `${scheme}://${workspaceSlug}.${appHost}${appPort}${path}`;
}
