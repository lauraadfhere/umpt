"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Book } from "@/lib/catalog";
import { BookCover } from "@/components/books/BookCover";
import { IconArrowRight, IconUser } from "@/components/ui/Icons";

export function BookCard({ book }: { book: Book }) {
  const t = useTranslations("books");

  return (
    <article id={book.slug} className="flex scroll-mt-24 flex-col">
      <div className="flex gap-4">
        <Link href={`/books/${book.slug}`}>
          <BookCover title={book.title} cover={book.cover} isNew={book.isNew} newLabel={t("new")} className="h-[118px] w-[90px]" />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="border-b-2 border-text pb-2 text-[16px] leading-snug font-semibold text-text">
            <Link href={`/books/${book.slug}`} className="hover:text-link">
              {book.title}
            </Link>
          </h3>
          {book.authors.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-1 gap-y-1.5 text-[14px]">
              {book.authors.map((author, index) => (
                <li key={author} className="flex items-center gap-1.5">
                  <IconUser className="size-[18px]" />
                  <span className="text-muted">{author}</span>
                  {index < book.authors.length - 1 && <span className="text-muted">,</span>}
                </li>
              ))}
            </ul>
          )}
          {book.year && <p className="mt-3 text-[15px] text-muted">{book.year}</p>}
        </div>
      </div>
      {book.excerpt && <p className="mt-4 line-clamp-4 text-[15px] leading-[1.5] text-text">{book.excerpt}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/books/${book.slug}`}
          className="inline-flex w-fit items-center gap-2 bg-link px-4 py-2 text-[14px] font-semibold text-white hover:bg-link-hover"
        >
          {t("viewBook")}
          <IconArrowRight className="h-3 w-7 rtl:rotate-180" />
        </Link>
        {book.buyUrl ? (
          <a
            href={book.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-link underline underline-offset-2 hover:text-link-hover"
          >
            {t("buyNow")}
          </a>
        ) : null}
      </div>
    </article>
  );
}