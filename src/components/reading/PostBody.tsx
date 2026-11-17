/* eslint-disable @next/next/no-img-element -- post images come from arbitrary Parse/R2 hosts */
import { ABSTRACT_ID, INTRO_ID, type BodySection } from "@/lib/post-sections";
import type { RichElement, RichNode } from "@/lib/richtext";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Context = { embedLabel: string; inPre?: boolean };

const isBlankText = (node: RichNode) => node.type === "text" && !node.value.trim();
const elementsOf = (nodes: RichNode[], tags: string[]) => nodes.filter((node): node is RichElement => node.type === "element" && tags.includes(node.tag));
const hasText = (node: RichElement) => node.children.some((child) => child.type === "element" || child.value.trim());

/** Browsers add a missing <tbody>; doing it here keeps the server markup identical to the DOM. */
function tableSections(node: RichElement, context: Context) {
  const groups: React.ReactNode[] = [];
  let loose: RichElement[] = [];
  const flush = () => {
    if (loose.length) groups.push(<tbody key={groups.length}>{loose.map((row, index) => renderRow(row, index, context))}</tbody>);
    loose = [];
  };

  for (const child of node.children) {
    if (child.type !== "element") continue;
    if (child.tag === "tr") loose.push(child);
    else if (child.tag === "thead" || child.tag === "tbody") {
      flush();
      const Group = child.tag;
      groups.push(<Group key={groups.length}>{elementsOf(child.children, ["tr"]).map((row, index) => renderRow(row, index, context))}</Group>);
    }
  }
  flush();
  return groups;
}

function renderRow(row: RichElement, key: number, context: Context) {
  return (
    <tr key={key}>
      {elementsOf(row.children, ["th", "td"]).map((cell, index) =>
        cell.tag === "th" ? (
          <th key={index} className="border border-rule bg-panel-head px-3 py-2 text-start font-semibold">
            {renderNodes(cell.children, context)}
          </th>
        ) : (
          <td key={index} className="border border-rule px-3 py-2 align-top [&>p:first-child]:mt-0">
            {renderNodes(cell.children, context)}
          </td>
        ),
      )}
    </tr>
  );
}

function renderNodes(nodes: RichNode[], context: Context): React.ReactNode[] {
  return nodes.map((node, index) => renderNode(node, index, context));
}

function renderNode(node: RichNode, key: number, context: Context): React.ReactNode {
  if (node.type === "text") return node.value;
  const children = () => renderNodes(node.children, context);

  switch (node.tag) {
    case "p":
      return hasText(node) ? <p key={key} className="mt-2.5 first:mt-0">{children()}</p> : null;
    case "h1":
    case "h2":
    case "h3":
      return hasText(node) ? <h3 key={key} className="mt-5 text-[18px] leading-tight font-semibold text-text">{children()}</h3> : null;
    case "h4":
      return hasText(node) ? <h4 key={key} className="mt-4 text-[16px] leading-tight font-semibold text-text">{children()}</h4> : null;
    case "ul":
    case "ol": {
      const List = node.tag;
      const items = node.children.filter((child) => !isBlankText(child));
      if (!items.length) return null;
      return (
        <List key={key} className={`mt-2.5 space-y-0.5 ps-7 [li>&]:mt-1 ${node.tag === "ol" ? "list-decimal" : "list-disc"}`}>
          {items.map((item, index) =>
            item.type === "element" && item.tag === "li" ? (
              <li key={index} className="ps-1 [&>p:first-child]:mt-0">{renderNodes(item.children, context)}</li>
            ) : (
              <li key={index} className="ps-1">{renderNode(item, 0, context)}</li>
            ),
          )}
        </List>
      );
    }
    case "li":
      return <div key={key} className="mt-2.5">{children()}</div>;
    case "blockquote":
      return (
        <blockquote key={key} className="mt-4 border-s-4 border-accent bg-panel px-4 py-3 italic [&>p:first-child]:mt-0">
          {children()}
        </blockquote>
      );
    case "pre":
      return (
        <pre key={key} dir="ltr" className="mt-3 overflow-x-auto border border-rule bg-[#f7f7f7] p-3 text-start font-mono text-[13px] leading-[1.55] text-text">
          {renderNodes(node.children, { ...context, inPre: true })}
        </pre>
      );
    case "code":
      return context.inPre ? (
        <code key={key}>{children()}</code>
      ) : (
        <code key={key} dir="ltr" className="bg-panel px-1 py-0.5 font-mono text-[0.88em]">{children()}</code>
      );
    case "hr":
      return <hr key={key} className="my-5 border-rule" />;
    case "br":
      return <br key={key} />;
    case "strong":
      return <strong key={key} className="font-semibold">{children()}</strong>;
    case "em":
      return <em key={key}>{children()}</em>;
    case "u":
      return <u key={key} className="underline-offset-2">{children()}</u>;
    case "a": {
      const external = /^https?:/i.test(node.href ?? "");
      return (
        <a key={key} href={node.href} rel={external ? "noopener noreferrer" : undefined} className="text-link underline underline-offset-2 hover:text-link-hover">
          {children()}
        </a>
      );
    }
    case "img":
      return <img key={key} src={node.src} alt={node.alt ?? ""} loading="lazy" decoding="async" className="mt-4 inline-block h-auto max-w-full" />;
    case "figure":
      return <figure key={key} className="mt-4 [&>img]:mt-0">{children()}</figure>;
    case "figcaption":
      return <figcaption key={key} className="mt-2 text-[13px] leading-normal italic text-muted">{children()}</figcaption>;
    case "table":
      return (
        <div key={key} className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-[14px] leading-[1.55]">{tableSections(node, context)}</table>
        </div>
      );
    case "iframe":
      return (
        <div key={key} className="mt-4 aspect-video bg-panel">
          <iframe
            src={node.src}
            title={context.embedLabel}
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            className="h-full w-full border-0"
          />
        </div>
      );
    case "div":
      return <div key={key}>{children()}</div>;
    case "span":
      return <span key={key}>{children()}</span>;
    default:
      // Table parts that turn up outside a table keep their text.
      return <span key={key}>{children()}</span>;
  }
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 pt-6 first:pt-0">
      <SectionTitle size="md" tone="accent">
        <span id={`${id}-title`}>{title}</span>
      </SectionTitle>
      {children}
    </section>
  );
}

type Props = {
  excerpt: string;
  sections: BodySection[];
  labels: { abstract: string; introduction: string; fullText: string; embed: string };
};

export function PostBody({ excerpt, sections, labels }: Props) {
  const context: Context = { embedLabel: labels.embed };

  return (
    <div className="w-full leading-[1.62] break-words text-text">
      {excerpt && (
        <Section id={ABSTRACT_ID} title={labels.abstract}>
          <p className="mt-2.5">{excerpt}</p>
        </Section>
      )}
      {sections.map((section) => (
        <Section key={section.id} id={section.id} title={section.title ?? (section.id === INTRO_ID ? labels.introduction : labels.fullText)}>
          {renderNodes(section.nodes, context)}
        </Section>
      ))}
    </div>
  );
}
