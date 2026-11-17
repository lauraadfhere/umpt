"use client";

import { useTranslations } from "next-intl";
import type { Book } from "@/lib/catalog";

function Item({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  if (!value) return null;
  return (
    <li className="flex min-w-[7.5rem] flex-1 flex-col items-center gap-1 border-s border-rule px-3 py-2 text-center first:border-s-0">
      <span className="text-muted" aria-hidden>
        {icon}
      </span>
      <span className="text-[11px] text-muted">{label}</span>
      <span className="text-[13px] font-medium text-text">{value}</span>
    </li>
  );
}

export function BookMetadataBar({ book }: { book: Book }) {
  const t = useTranslations("books.detail");
  const published = book.publishedAt || book.year;
  const hasAny =
    book.readingAge || book.pageCount || book.language || book.format || published || book.isbn;
  if (!hasAny) return null;

  return (
    <ul className="mt-6 flex flex-wrap border border-rule bg-panel">
      <Item
        label={t("readingAge")}
        value={book.readingAge}
        icon={
          <svg className="mx-auto size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="12" cy="8" r="3" />
            <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
          </svg>
        }
      />
      <Item
        label={t("printLength")}
        value={book.pageCount ? `${book.pageCount} ${t("pages")}` : ""}
        icon={
          <svg className="mx-auto size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M5 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" />
            <path d="M7 20h10" />
          </svg>
        }
      />
      <Item
        label={t("language")}
        value={book.language}
        icon={
          <svg className="mx-auto size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        }
      />
      <Item
        label={t("published")}
        value={published}
        icon={
          <svg className="mx-auto size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="4" y="5" width="16" height="15" rx="1" />
            <path d="M8 3v4M16 3v4" />
          </svg>
        }
      />
      <Item
        label={t("isbn")}
        value={book.isbn}
        icon={
          <svg className="mx-auto size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 7h2v10H4zM8 5h2v14H8zM12 7h2v10h-2zM16 5h2v14h-2zM20 7h2v10h-2z" />
          </svg>
        }
      />
    </ul>
  );
}