import { textValue, type ParseRecord } from "@/lib/parse";

/** Extended product metadata for the book detail page. */
export type BookDetails = {
  isbn: string;
  /** Longer blurb (falls back to excerpt when empty). */
  description: string;
  pageCount: string;
  readingAge: string;
  language: string;
  format: string;
  category: string;
  publishedAt: string;
  publisher: string;
  sampleUrl: string;
  price: string;
};

export const EMPTY_BOOK_DETAILS: BookDetails = {
  isbn: "",
  description: "",
  pageCount: "",
  readingAge: "",
  language: "English",
  format: "",
  category: "",
  publishedAt: "",
  publisher: "",
  sampleUrl: "",
  price: "",
};

export type BookSeedExtended = {
  title: string;
  slug: string;
  authors: string[];
  year: string;
  excerpt: string;
  cover: string;
  buyUrl: string;
  isNew: boolean;
} & BookDetails;

export function parseBookDetails(record: ParseRecord, excerptFallback: string): BookDetails {
  const description = textValue(record.description) || textValue(record.longDescription) || excerptFallback;
  return {
    isbn: textValue(record.isbn) || textValue(record.ISBN),
    description,
    pageCount: textValue(record.pageCount) || textValue(record.pages),
    readingAge: textValue(record.readingAge) || textValue(record.reading_age),
    language: textValue(record.language) || textValue(record.bookLanguage) || "English",
    format: textValue(record.format) || textValue(record.bookFormat),
    category: textValue(record.category) || textValue(record.genre),
    publishedAt: textValue(record.publishedAt) || textValue(record.publicationDate),
    publisher: textValue(record.publisher),
    sampleUrl: textValue(record.sampleUrl) || textValue(record.readSampleUrl),
    price: textValue(record.price) || textValue(record.displayPrice),
  };
}

export function detailsFromInput(raw: Record<string, unknown>, excerpt: string): BookDetails {
  const pick = (key: keyof BookDetails) => (typeof raw[key] === "string" ? raw[key].trim() : "");
  return {
    isbn: pick("isbn").slice(0, 32),
    description: (pick("description") || excerpt).slice(0, 12000),
    pageCount: pick("pageCount").slice(0, 12),
    readingAge: pick("readingAge").slice(0, 40),
    language: pick("language").slice(0, 40) || "English",
    format: pick("format").slice(0, 80),
    category: pick("category").slice(0, 120),
    publishedAt: pick("publishedAt").slice(0, 32),
    publisher: pick("publisher").slice(0, 120),
    sampleUrl: pick("sampleUrl").slice(0, 500),
    price: pick("price").slice(0, 32),
  };
}

export function detailsToParse(details: BookDetails) {
  return {
    isbn: details.isbn || undefined,
    description: details.description || undefined,
    longDescription: details.description || undefined,
    pageCount: details.pageCount || undefined,
    readingAge: details.readingAge || undefined,
    language: details.language || undefined,
    format: details.format || undefined,
    category: details.category || undefined,
    publishedAt: details.publishedAt || undefined,
    publisher: details.publisher || undefined,
    sampleUrl: details.sampleUrl || undefined,
    price: details.price || undefined,
  };
}