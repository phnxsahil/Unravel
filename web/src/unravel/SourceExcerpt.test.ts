import { describe, expect, it } from "vitest";
import { highlightedLines } from "./SourceExcerpt";

describe("source highlighting", () => {
  it("keeps JSX prose plain while recognizing TypeScript expressions", () => {
    const html = highlightedLines(
      "const view = <p>This is plain text. Use the Upload photo button.</p>;",
      "tsx",
    ).join("\n");
    expect(html).toContain("This is plain text. Use the Upload photo button.");
    expect(html).toContain("hljs-keyword");
    expect(html).not.toMatch(/hljs-keyword[^>]*>(This|Use|Upload)/);
  });
  it("balances markup across multiline comments and escapes source HTML", () => {
    const lines = highlightedLines(
      '/* first\nsecond */\nconst x = "<script>";',
      "typescript",
    );
    expect(lines).toHaveLength(3);
    for (const line of lines)
      expect((line.match(/<span/g) || []).length).toBe(
        (line.match(/<\/span>/g) || []).length,
      );
    expect(lines[2]).toContain("&lt;script&gt;");
  });
});
