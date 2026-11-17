import { revalidateTag } from "next/cache";
import { deleteAdminBook, getAdminBookById, readBookInput, updateAdminBook } from "@/lib/admin-books";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const book = await getAdminBookById(id);
  if (!book) return Response.json({ error: "Book not found." }, { status: 404 });
  return Response.json(book);
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existing = await getAdminBookById(id);
  if (!existing) return Response.json({ error: "Book not found." }, { status: 404 });

  const parsed = readBookInput(body, existing);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    await updateAdminBook(id, parsed);
    revalidateTag("books", "max");
    return Response.json({ id, slug: parsed.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the book.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    await deleteAdminBook(id);
    revalidateTag("books", "max");
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the book.";
    return Response.json({ error: message }, { status: 503 });
  }
}