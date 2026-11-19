import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/posts";
import { SectionsNav, type SectionLink } from "@/components/reading/SectionsNav";
import { ReadingSidebarAskQuestion, type SidebarQuestion } from "@/components/reading/ReadingSidebarAskQuestion";
import { ReadingSidebarNewsletter } from "@/components/reading/ReadingSidebarNewsletter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IconArrowRight } from "@/components/ui/Icons";

type Props = {
  title: string;
  year: string;
  previous: PostSummary | null;
  next: PostSummary | null;
  sections: SectionLink[];
  latestQuestions?: SidebarQuestion[];
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

export function PostAdjacentNav({ previous, next }: Pick<Props, "previous" | "next">) {
  const t = useTranslations("reading");
  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b border-rule pb-4 text-[13px] md:hidden">
      <Step post={previous} label={t("previous")} direction="previous" />
      <Step post={next} label={t("next")} direction="next" />
    </div>
  );
}

export function ReadingSidebar({ title, year, previous, next, sections, latestQuestions = [] }: Props) {
  const t = useTranslations("reading");

  return (
    <aside aria-label={t("sections")} className="hidden self-start bg-panel md:block">
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
      <ReadingSidebarAskQuestion latest={latestQuestions} />
      <ReadingSidebarNewsletter />
    </aside>
  );
}
