import type { Feature } from "./types";

export function pageCount(features: Feature[]): number {
  return features.filter(
    (feature) =>
      feature.category === "Interface" &&
      /(?:^|\/)app\/(?:.*\/)?page\.[jt]sx?$/.test(feature.paths[0] || ""),
  ).length;
}

export function rankFeatures(features: Feature[]): Feature[] {
  return [...features].sort(
    (a, b) =>
      Number(a.category === "Framework files") -
        Number(b.category === "Framework files") ||
      (b.edge_count || 0) - (a.edge_count || 0) ||
      Number(b.category === "Interface") - Number(a.category === "Interface") ||
      a.title.localeCompare(b.title),
  );
}

export function featureGroups(
  features: Feature[],
): { title: string; items: Feature[]; framework: boolean }[] {
  const groups = new Map<string, Feature[]>();
  for (const feature of features) {
    const title =
      feature.category === "Backend request"
        ? feature.paths[0]
        : feature.category === "Framework files"
          ? "Framework files"
          : "Screens and components";
    groups.set(title, [...(groups.get(title) || []), feature]);
  }
  return [...groups].map(([title, items]) => ({
    title,
    items,
    framework: title === "Framework files",
  }));
}
