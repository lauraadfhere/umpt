import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBookBySlug } from "@/lib/catalog";
import { metaDescription, pageMetadata } from "@/lib/seo";
import { PageShell } from "@/components/layout/PageShell";
import { BookCover } from "@/components/books/BookCover";
import { BookDescription } from "@/components/books/BookDescription";
import { BookMetadataBar } from "@/components/books/BookMetadataBar";
import { BookPurchaseCard } from "@/components/books/BookPurchaseCard";
import { BookReviews } from "@/components/books/BookReviews";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book" };
  const description = metaDescription(book.excerpt || book.description);
  return pageMetadata({ locale, path: `/books/${slug}`, title: book.title, description });
}

export default async function BookDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const t = await getTranslations("books");
  const tDetail = await getTranslations("books.detail");
  const tCommon = await getTranslations("breadcrumb");

  const description = book.description || book.excerpt;
  const trail = [
    { label: tCommon("home"), href: "/" },
    { label: t("heroTitle"), href: "/books" },
    ...(book.category ? [{ label: book.category }] : []),
    { label: book.title },
  ];

  return (
    <PageShell
      active="books"
      breadcrumbs={trail}
      hero={{ title: t("heroTitle"), search: { action: `/${locale}/books`, placeholder: t("heroSearch") } }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,260px)] lg:gap-x-10">
          <aside className="flex flex-col items-start gap-4">
            <BookCover title={book.title} cover={book.cover} isNew={book.isNew} newLabel={t("new")} className="h-auto w-full max-w-[200px]" />
            {book.sampleUrl ? (
              <a
                href={book.sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-[200px] border border-rule bg-panel px-4 py-2.5 text-center text-[14px] font-semibold text-text hover:border-link hover:text-link"
              >
                {tDetail("readSample")}
              </a>
            ) : null}
          </aside>

          <div className="min-w-0">
            {book.category && (
              <p className="text-[13px] text-muted">
                <Link href="/books" className="text-link hover:underline">
                  {t("heroTitle")}
                </Link>
                <span className="mx-1.5" aria-hidden>
                  ›
                </span>
                <span>{book.category}</span>
              </p>
            )}
            <h1 className="mt-2 text-[28px] leading-[1.2] font-semibold text-text sm:text-[32px]">{book.title}</h1>
            {book.authors.length > 0 && (
              <p className="mt-2 text-[15px] text-muted">
                {tDetail("by")}{" "}
                {book.authors.map((author, index) => (
                  <span key={author}>
                    <span className="text-link">{author}</span>
                    {index < book.authors.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}
            {book.format && (
              <p className="mt-2 text-[14px] text-muted">
                {tDetail("format")}: <span className="text-text">{book.format}</span>
              </p>
            )}
            {book.publisher && <p className="mt-1 text-[13px] text-muted">{tDetail("publisher", { name: book.publisher })}</p>}

            {description && (
              <section className="mt-6">
                <BookDescription text={description} />
              </section>
            )}

            <BookMetadataBar book={book} />
          </div>

          <BookPurchaseCard buyUrl={book.buyUrl} price={book.price} format={book.format} />
        </div>

        <section className="mt-12 border-t border-rule pt-10">
          <BookReviews bookSlug={book.slug} bookTitle={book.title} />
        </section>
      </div>
    </PageShell>
  );
}