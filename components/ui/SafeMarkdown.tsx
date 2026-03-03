import { Fragment } from "react";

interface SafeMarkdownProps {
  markdown: string;
  className?: string;
}

interface BlockParagraph {
  type: "paragraph";
  lines: string[];
}

interface BlockList {
  type: "list";
  items: string[];
}

interface BlockHeading {
  type: "heading";
  level: 1 | 2 | 3;
  text: string;
}

type MarkdownBlock = BlockParagraph | BlockList | BlockHeading;

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = (): void => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraphBuffer });
      paragraphBuffer = [];
    }
  };

  const flushList = (): void => {
    if (listBuffer.length > 0) {
      blocks.push({ type: "list", items: listBuffer });
      listBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 3, text: trimmed.slice(4).trim() });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 2, text: trimmed.slice(3).trim() });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: 1, text: trimmed.slice(2).trim() });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function SafeMarkdown({ markdown, className }: SafeMarkdownProps): JSX.Element {
  const blocks = parseMarkdown(markdown);

  return (
    <div className={className || "space-y-3 text-sm leading-7 text-[var(--color-text)]"}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h2 key={`h1-${index}`} className="text-base font-semibold text-[var(--color-text)]">
                {block.text}
              </h2>
            );
          }

          if (block.level === 2) {
            return (
              <h3 key={`h2-${index}`} className="text-sm font-semibold text-[var(--color-text)]">
                {block.text}
              </h3>
            );
          }

          return (
            <h4 key={`h3-${index}`} className="text-sm font-medium text-[var(--color-text)]">
              {block.text}
            </h4>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`li-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${index}`}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={`line-${index}-${lineIndex}`}>
                {line}
                {lineIndex < block.lines.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
