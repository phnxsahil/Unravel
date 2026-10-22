import { describe, it, expect } from "vitest";
import { rankFeatures, featureGroups, pageCount } from "./studio-features";
import type { Feature } from "./types";

const feature = (
  title: string,
  category: string,
  path: string,
  edge_count: number,
): Feature => ({
  id: title,
  title,
  category,
  paths: [path],
  edge_count,
  description: "",
  entry_line: 1,
  questions: [],
});

describe("Connected project starting points", () => {
  it("counts Next.js pages separately from their components", () => {
    expect(
      pageCount([
        feature("Home", "Interface", "frontend/src/app/page.tsx", 0),
        feature("Chat", "Interface", "frontend/app/(app)/chat/page.tsx", 2),
        feature(
          "Chat Interface",
          "Interface",
          "frontend/components/ChatInterface.tsx",
          1,
        ),
        feature("Layout", "Framework files", "frontend/app/layout.tsx", 2),
      ]),
    ).toBe(2);
  });
  it("recommends the most connected real feature before framework files", () => {
    const ordered = rankFeatures([
      feature("Home", "Interface", "app/page.tsx", 0),
      feature("Layout", "Framework files", "app/layout.tsx", 9),
      feature("POST /chat/stream", "Backend request", "chat.py", 3),
      feature("Chat", "Interface", "app/chat/page.tsx", 2),
    ]);
    expect(ordered[0].title).toBe("POST /chat/stream");
    expect(ordered.at(-1)?.category).toBe("Framework files");
  });

  it("keeps every route grouped by its source file", () => {
    const routes = Array.from({ length: 15 }, (_, i) =>
      feature(`GET /item${i}`, "Backend request", "routes.py", 1),
    );
    const groups = featureGroups([
      ...routes,
      feature("Chat", "Interface", "app/chat/page.tsx", 2),
    ]);
    expect(groups.find((g) => g.title === "routes.py")?.items).toHaveLength(15);
    expect(
      groups.find((g) => g.title === "Screens and components")?.items[0].title,
    ).toBe("Chat");
  });
});
