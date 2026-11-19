import { parseRichText, type RichElement, type RichNode } from "@/lib/richtext";

function renderNodes(nodes: RichNode[]) {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.value;
    const element = node as RichElement;
    const kids = renderNodes(element.children);
    switch (element.tag) {
      case "p":
        return (
          <p key={index} className="[&:not(:first-child)]:mt-2">
            {kids}
          </p>
        );
      case "br":
        return <br key={index} />;
      case "strong":
        return <strong key={index}>{kids}</strong>;
      case "em":
        return <em key={index}>{kids}</em>;
      case "u":
        return <u key={index}>{kids}</u>;
      case "a":
        return element.href ? (
          <a key={index} href={element.href} className="text-link underline-offset-2 hover:underline" rel="noreferrer noopener" target="_blank">
            {kids}
          </a>
        ) : (
          <span key={index}>{kids}</span>
        );
      case "blockquote":
        return (
          <blockquote key={index} className="border-s-2 border-rule ps-3 italic">
            {kids}
          </blockquote>
        );
      case "ul":
        return (
          <ul key={index} className="list-disc ps-5">
            {kids}
          </ul>
        );
      case "ol":
        return (
          <ol key={index} className="list-decimal ps-5">
            {kids}
          </ol>
        );
      case "li":
        return <li key={index}>{kids}</li>;
      case "img":
        return element.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- comment images from public uploads
          <img key={index} src={element.src} alt={element.alt ?? ""} loading="lazy" decoding="async" className="mt-2 max-h-[360px] w-auto max-w-full rounded-sm border border-rule" />
        ) : null;
      case "figure":
        return (
          <figure key={index} className="mt-2 [&>img]:mt-0">
            {kids}
          </figure>
        );
      case "figcaption":
        return (
          <figcaption key={index} className="mt-1 text-[12px] italic text-muted">
            {kids}
          </figcaption>
        );
      default:
        return <span key={index}>{kids}</span>;
    }
  });
}

export function CommentMessageBody({ html, plainClassName }: { html: string; plainClassName?: string }) {
  const nodes = parseRichText(html);
  if (nodes.length === 0) {
    return <p className={plainClassName}>{html.replace(/<[^>]*>/g, " ").trim()}</p>;
  }
  return <div className={`comment-body space-y-1 leading-[1.55] ${plainClassName ?? ""}`}>{renderNodes(nodes)}</div>;
}