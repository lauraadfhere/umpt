/** Renders sanitized CMS / fallback HTML for About, Contact, Privacy and Terms. */
export function SiteRichContent({ html }: { html: string; title?: string }) {
  if (!html.trim()) return null;
  return (
    <div
      className="site-rich max-w-[780px] text-[16px] leading-[1.95] break-words text-text [&_a]:text-link [&_a]:underline hover:[&_a]:text-link-hover [&_h2]:mt-8 [&_h2]:text-[22px] [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mt-4 [&_p:first-child]:mt-0 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
