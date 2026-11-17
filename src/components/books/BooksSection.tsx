import { useTranslations } from "next-intl";
import type { Book } from "@/lib/catalog";
import { BookCard } from "@/components/books/BookCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

function Watermark() {
  return (
    <svg className="pointer-events-none absolute -end-10 top-0 h-full w-[420px] text-[#f4f4f4]" viewBox="0 0 400 400" aria-hidden>
      <g fill="currentColor">
        <path d="M200 0 L240 160 L400 120 L260 220 L360 400 L200 270 L60 400 L150 220 L0 140 L170 160 Z" />
      </g>
    </svg>
  );
}

export function BooksSection({ books, title }: { books: Book[]; title?: string }) {
  const t = useTranslations("books");

  return (
    <section className="relative overflow-hidden">
      <Watermark />
      <div className="relative mx-auto max-w-[1200px] px-6 py-10">
        <SectionTitle className="mb-8">{title ?? t("sectionTitle")}</SectionTitle>
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
