// Server-only catalog reads. Falls back to bundled samples when Parse is unset, unreachable, or empty.
import { unstable_cache } from "next/cache";
import { fileUrl, isParseConfigured, query, textValue, type ParseRecord } from "@/lib/parse";
import type { BookDetails } from "@/lib/book-details";
import { parseBookDetails } from "@/lib/book-details";
import { BUNDLED_BOOK_IMPORTS } from "@/lib/book-seed";

export type Book = {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  year: string;
  excerpt: string;
  cover: string;
  buyUrl: string;
  isNew: boolean;
} & BookDetails;

export type Project = {
  id: string;
  slug: string;
  acronym: string;
  title: string;
  year: number;
  /** ISO date the record was added; used only to order "latest" lists. */
  addedAt: string;
  contextHtml: string;
  reportHtml: string;
};

/** @deprecated use Project */
export type Proceeding = Project;

export type CatalogSource = "parse" | "sample";

const sampleBooks: Book[] = BUNDLED_BOOK_IMPORTS.map((book, index) => ({
  id: `s${index + 1}`,
  slug: book.slug,
  title: book.title,
  authors: book.authors,
  year: book.year,
  excerpt: book.excerpt,
  cover: book.cover,
  buyUrl: book.buyUrl,
  isNew: book.isNew,
  isbn: book.isbn,
  description: book.description || book.excerpt,
  pageCount: book.pageCount,
  readingAge: book.readingAge,
  language: book.language,
  format: book.format,
  category: book.category,
  publishedAt: book.publishedAt,
  publisher: book.publisher,
  sampleUrl: book.sampleUrl,
  price: book.price,
}));

const sampleProceedings: Proceeding[] = [
  ["AIES", "AAAI/ACM Conference on AI, Ethics, and Society"],
  ["ASPLOS", "Architectural Support for Programming Languages and Operating Systems"],
  ["CCS", "Conference on Computer and Communications Security"],
  ["CHI", "Conference on Human Factors in Computing Systems"],
  ["CIKM", "Conference on Information and Knowledge Management"],
  ["DIS", "Designing Interactive Systems Conference"],
  ["EC", "Conference on Economics and Computation"],
  ["FAccT", "Conference on Fairness, Accountability, and Transparency"],
  ["GECCO", "Genetic and Evolutionary Computation Conference"],
  ["HT", "Conference on Hypertext and Social Media"],
  ["ICSE", "International Conference on Software Engineering"],
  ["IMC", "Internet Measurement Conference"],
  ["KDD", "Conference on Knowledge Discovery and Data Mining"],
  ["L@S", "Conference on Learning @ Scale"],
  ["MM", "International Conference on Multimedia"],
  ["MobiCom", "International Conference on Mobile Computing and Networking"],
  ["OOPSLA", "Object-Oriented Programming, Systems, Languages, and Applications"],
  ["PLDI", "Conference on Programming Language Design and Implementation"],
  ["PODC", "Symposium on Principles of Distributed Computing"],
  ["RecSys", "Conference on Recommender Systems"],
  ["SIGCSE", "Technical Symposium on Computer Science Education"],
  ["SIGGRAPH", "Special Interest Group on Computer Graphics and Interactive Techniques"],
  ["SIGMOD", "International Conference on Management of Data"],
  ["SOSP", "Symposium on Operating Systems Principles"],
  ["SOUPS", "Symposium on Usable Privacy and Security"],
  ["STOC", "Symposium on Theory of Computing"],
  ["UIST", "Symposium on User Interface Software and Technology"],
  ["WSDM", "Conference on Web Search and Data Mining"],
  ["WWW", "The Web Conference"],
].map(([acronym, title], index) => ({
  id: `p${index}`,
  slug: acronym.toLowerCase(),
  acronym,
  title,
  year: 2026,
  addedAt: `2026-01-${String(((index * 7) % 28) + 1).padStart(2, "0")}`,
  contextHtml: "",
  reportHtml: "",
}));

/** Newest first; ties fall back to the conference year. */
export function latestFirst(proceedings: Proceeding[]): Proceeding[] {
  return [...proceedings].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.year - a.year);
}

function authorsValue(record: ParseRecord): string[] {
  const raw = record.authors ?? record.author;
  if (Array.isArray(raw)) return raw.map(textValue).filter(Boolean);
  const text = textValue(raw);
  return text ? text.split(/\s*,\s*/) : [];
}

function toBook(record: ParseRecord): Book | null {
  const slug = textValue(record.slug);
  const title = textValue(record.title);
  if (!slug || !title) return null;
  const created = textValue(record.createdAt);
  const buyUrl = textValue(record.buyUrl) || textValue(record.amazonUrl) || textValue(record.storeUrl);
  const excerpt = textValue(record.excerpt) || textValue(record.description);
  return {
    id: record.objectId,
    slug,
    title,
    authors: authorsValue(record),
    year: textValue(record.year) || created.slice(0, 4),
    excerpt,
    cover: fileUrl(record.cover) || fileUrl(record.coverImage) || textValue(record.cover),
    buyUrl,
    isNew: record.isNew === true,
    ...parseBookDetails(record, excerpt),
  };
}

const fetchBooksFromParse = unstable_cache(
  async () => {
    const records = await query("Book", new URLSearchParams({ order: "-createdAt", limit: "100" }));
    return records.map(toBook).filter((book): book is Book => book !== null);
  },
  ["catalog-books"],
  { revalidate: 60, tags: ["books"] },
);

function slugFromRecord(record: ParseRecord, title: string, acronym: string) {
  const slug = textValue(record.slug);
  if (slug) return slug;
  return (acronym || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toProject(record: ParseRecord): Project | null {
  const title = textValue(record.title);
  if (!title) return null;
  const acronym = textValue(record.acronym) || title.split(/\s+/)[0];
  return {
    id: record.objectId,
    slug: slugFromRecord(record, title, acronym),
    acronym,
    title,
    year: Number(record.year) || new Date().getFullYear(),
    addedAt: textValue(record.createdAt),
    contextHtml: textValue(record.context) || textValue(record.contextHtml),
    reportHtml: textValue(record.report) || textValue(record.reportHtml),
  };
}

export async function getBooks(): Promise<{ books: Book[]; source: CatalogSource }> {
  if (!isParseConfigured()) return { books: sampleBooks, source: "sample" };
  try {
    const books = await fetchBooksFromParse();
    return books.length ? { books, source: "parse" } : { books: sampleBooks, source: "sample" };
  } catch {
    return { books: sampleBooks, source: "sample" };
  }
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const normalized = slug.trim();
  if (!normalized) return null;
  const { books } = await getBooks();
  return books.find((book) => book.slug === normalized) ?? null;
}

const fetchProjectsFromParse = unstable_cache(
  async () => {
    const projects = await query("Project", new URLSearchParams({ order: "acronym", limit: "500" }));
    let records = projects;
    if (!records.length) {
      records = await query("Proceeding", new URLSearchParams({ order: "acronym", limit: "500" }));
    }
    return records.map(toProject).filter((item): item is Project => item !== null);
  },
  ["catalog-projects"],
  { revalidate: 60, tags: ["projects"] },
);

export async function getProjects(): Promise<{ projects: Project[]; source: CatalogSource }> {
  if (!isParseConfigured()) return { projects: sampleProceedings, source: "sample" };
  try {
    const projects = await fetchProjectsFromParse();
    return projects.length ? { projects, source: "parse" } : { projects: sampleProceedings, source: "sample" };
  } catch {
    return { projects: sampleProceedings, source: "sample" };
  }
}

/** @deprecated use getProjects */
export async function getProceedings(): Promise<{ proceedings: Project[]; source: CatalogSource }> {
  const { projects, source } = await getProjects();
  return { proceedings: projects, source };
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  const { projects } = await getProjects();
  return projects.find((project) => project.slug === normalized) ?? null;
}
