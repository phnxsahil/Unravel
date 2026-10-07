import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
import { useEffect, useRef, useState } from "react";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);

// The public story renders several excerpts of the same fixture. Parse once,
// with a small bounded cache; do not retain arbitrary large captured sources.
const highlightCache = new Map<string, string[]>();

export function highlightedLines(source: string, language: string): string[] {
  const key = language + "\0" + source;
  const cached = highlightCache.get(key);
  if (cached) return cached;
  const html = hljs.highlight(source, {
    language: language === "tsx" ? "typescript" : language,
    ignoreIllegals: true,
  }).value;
  const open: string[] = [];
  const lines: string[] = [];
  let line = "";
  for (const token of html.split(/(<span[^>]*>|<\/span>|\n)/)) {
    if (token === "\n") {
      lines.push(line + "</span>".repeat(open.length));
      line = open.join("");
    } else {
      if (token.startsWith("<span")) open.push(token);
      else if (token === "</span>") open.pop();
      line += token;
    }
  }
  lines.push(line + "</span>".repeat(open.length));
  if (source.length <= 256000) {
    if (highlightCache.size >= 8) highlightCache.delete(highlightCache.keys().next().value!);
    highlightCache.set(key, lines);
  }
  return lines;
}

export default function SourceExcerpt({
  body,
  language,
  start,
  end,
  highlight,
  path,
}: {
  body: string;
  language: string;
  start: number;
  end: number;
  highlight?: number;
  path: string;
}) {
  const pre = useRef<HTMLPreElement>(null);
  const [overflow, setOverflow] = useState({
    horizontal: false,
    vertical: false,
  });
  useEffect(() => {
    const element = pre.current;
    if (!element || (element.closest(".static-story") && document.documentElement.classList.contains("js"))) return;
    const check = () => {
      const next = {
        horizontal: element.scrollWidth > element.clientWidth + 1,
        vertical: element.scrollHeight > element.clientHeight + 1,
      };
      setOverflow((current) =>
        current.horizontal === next.horizontal &&
        current.vertical === next.vertical
          ? current
          : next,
      );
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [body, start, end]);
  // Highlight the complete file so JSX and multiline token boundaries retain context.
  const lines = highlightedLines(body.trimEnd(), language).slice(
    start - 1,
    end,
  );
  return (
    <>
      <pre
        ref={pre}
        tabIndex={0}
        aria-label={`Source excerpt from ${path}, lines ${start} to ${end}`}
      >
        <code>
          {lines.map((line, index) => (
            <span
              key={index}
              className={`excerpt-line${index + start === highlight ? " is-highlighted" : ""}`}
            >
              <span className="excerpt-number" aria-hidden="true">
                {index + start}
              </span>
              <span dangerouslySetInnerHTML={{ __html: line || " " }} />
            </span>
          ))}
        </code>
      </pre>
      {(overflow.horizontal || overflow.vertical) && (
        <p className="source-scroll-hint">
          Scroll code{" "}
          {overflow.horizontal && overflow.vertical
            ? "horizontally or vertically"
            : overflow.horizontal
              ? "horizontally"
              : "vertically"}
          . Arrow keys work when focused.
        </p>
      )}
    </>
  );
}
