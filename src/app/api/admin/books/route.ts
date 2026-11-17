import { revalidateTag } from "next/cache";
import { createAdminBook, getAdminBooks, importBundledBooks, readBookInput } from "@/lib/admin-books";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return Response.json({ books: await getAdminBooks() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load books.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body && typeof body === "object" && (body as { action?: string }).action === "importBundled") {
    try {
      const result = await importBundledBooks();
      revalidateTag("books", "max");
      return Response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to import books.";
      return Response.json({ error: message }, { status: 503 });
    }
  }

  const parsed = readBookInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const created = await createAdminBook(parsed);
    revalidateTag("books", "max");
    return Response.json({ ...created, slug: parsed.slug }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the book.";
    return Response.json({ error: message }, { status: 503 });
  }
}