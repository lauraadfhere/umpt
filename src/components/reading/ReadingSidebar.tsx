import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/posts";
import { SectionsNav, type SectionLink } from "@/components/reading/SectionsNav";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrowRight } from "@/components/ui/Icons";

type Props = {
  title: string;
  year: string;
  previous: PostSummary | null;
  next: PostSummary | null;
  sections: SectionLink[];
};

function Step({ post, label, direction }: { post: PostSummary | null; label: string; direction: "previous" | "next" }) {
  const arrow = <IconArrowRight className={`h-2.5 w-5 ${direction === "previous" ? "rotate-180 rtl:rotate-0" : "rtl:rotate-180"}`} />;
  const content =
    direction === "previous" ? (
      <>
        {arrow}
        {label}
      </>
    ) : (
      <>
        {label}
        {arrow}
      </>
    );

  if (!post) return <span className="inline-flex items-center gap-1.5 text-[#b0b0b0]">{content}</span>;
  return (
    <Link href={`/posts/${post.slug}`} title={post.title} className="inline-flex items-center gap-1.5 text-link hover:text-link-hover hover:underline">
      {content}
    </Link>
  );
}

export function ReadingSidebar({ title, year, previous, next, sections }: Props) {
  const t = useTranslations("reading");

  return (
    <aside aria-label={t("sections")} className="self-start bg-panel">
      <div className="bg-panel-head px-3 py-2.5">
        <SectionTitle as="p" size="sm" tone="accent">
          {t("tableOfContents")}
        </SectionTitle>
      </div>
      <div className="px-3 pt-5 pb-5">
        <p className="line-clamp-3 text-[15px] leading-snug font-semibold italic text-text">{title}</p>
        {year && <p className="mt-2 text-[13px] text-muted">{year}</p>}
        <div className="mt-6 flex items-center justify-between gap-3 text-[13px]">
          <Step post={previous} label={t("previous")} direction="previous" />
          <Step post={next} label={t("next")} direction="next" />
        </div>
      </div>
      {sections.length > 0 && <SectionsNav items={sections} label={t("sectionsNav")} />}
    </aside>
  );
}
