// Server-only comment reads and moderation against the shared Parse Comment class.
import type { PostSummary } from "@/lib/posts";
import { MOCK_ROOT_COMMENTS_PER_POST } from "@/lib/mock-comments";
import { config, query, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { getProfileSettings } from "@/lib/profile";
import { plainToRichHtml, sanitizeRichText } from "@/lib/richtext";

const COMMENT_CLASS = "Comment";
const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;
const FALLBACK_SITE_AUTHOR_NAME = "UMPT Editorial";

export type Comment = {
  id: string;
  name: string;
  message: string;
  createdAt: string | null;
  parentId: string | null;
  isReply: boolean;
  likes: number;
  dislikes: number;
};

export type ModeratedComment = Comment & { slug: string; isApproved: boolean };

function dateValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { iso?: unknown }).iso === "string") return (value as { iso: string }).iso;
  return null;
}

function countValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

function toComment(record: ParseRecord): Comment {
  return {
    id: record.objectId,
    name: textValue(record.userName) || textValue(record.author) || "Reader",
    message: textValue(record.content),
    createdAt: dateValue(record.createdAt),
    parentId: textValue(record.parentId) || null,
    isReply: record.isReply === true,
    likes: countValue(record.likes),
    dislikes: countValue(record.dislikes),
  };
}

export async function getComments({ slug, postId }: { slug: string; postId?: string }): Promise<Comment[]> {
  const postReference = postId ? [{ articleSlug: slug }, { articleId: postId }] : [{ articleSlug: slug }];
  const parameters = new URLSearchParams({
    where: JSON.stringify({ $and: [{ $or: postReference }, { isApproved: true }, { isDeleted: { $ne: true } }] }),
    order: "-createdAt",
    limit: "100",
  });
  const records = await query(COMMENT_CLASS, parameters);
  const comments = records.map(toComment);
  const roots = comments.filter((item) => !item.parentId).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  const replies = comments.filter((item) => item.parentId).sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  return [...roots, ...replies];
}

export async function createApprovedComment(input: {
  slug: string;
  postId?: string;
  name: string;
  message: string;
  likes?: number;
  dislikes?: number;
}) {
  const { url } = config();
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      articleSlug: input.slug,
      articleId: input.postId,
      userName: input.name,
      content: input.message,
      isApproved: true,
      isDeleted: false,
      likes: input.likes ?? 0,
      dislikes: input.dislikes ?? 0,
      isReply: false,
      replyCount: 0,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || "Unable to save comment.");
  return { id: body.objectId };
}

export async function postHasComments(slug: string): Promise<boolean> {
  const { url } = config();
  const parameters = new URLSearchParams({
    where: JSON.stringify({ $and: [{ articleSlug: slug }, { isApproved: true }, { isDeleted: { $ne: true } }] }),
    limit: "1",
  });
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[] };
  if (!response.ok) return false;
  return (body.results?.length ?? 0) > 0;
}

export async function seedMockCommentsForPosts(
  posts: PostSummary[],
  draftsForPost: (post: PostSummary) => { name: string; message: string; likes: number; dislikes: number }[],
): Promise<{ created: number; skippedPosts: number; targetPerPost: number }> {
  let created = 0;
  let skippedPosts = 0;
  for (const post of posts) {
    const drafts = draftsForPost(post).slice(0, MOCK_ROOT_COMMENTS_PER_POST);
    const { created: added, existingRoots } = await seedMockCommentsForSlug(post, drafts);
    created += added;
    if (added === 0 && existingRoots >= MOCK_ROOT_COMMENTS_PER_POST) skippedPosts += 1;
  }
  return { created, skippedPosts, targetPerPost: MOCK_ROOT_COMMENTS_PER_POST };
}

/** Adds mock drafts for one post until it has at least as many root comments as drafts (never duplicates entire set). */
export async function seedMockCommentsForSlug(
  post: PostSummary,
  drafts: { name: string; message: string; likes: number; dislikes: number }[],
): Promise<{ created: number; existingRoots: number }> {
  const existing = await getComments({ slug: post.slug, postId: post.id });
  const roots = existing.filter((item) => !item.parentId);
  if (roots.length >= drafts.length) return { created: 0, existingRoots: roots.length };
  const toCreate = drafts.slice(roots.length);
  let created = 0;
  for (const draft of toCreate) {
    await createApprovedComment({
      slug: post.slug,
      postId: post.id,
      name: draft.name,
      message: draft.message,
      likes: draft.likes,
      dislikes: draft.dislikes,
    });
    created += 1;
  }
  return { created, existingRoots: roots.length };
}

export async function createComment(input: { slug: string; postId?: string; name: string; email?: string; message: string }) {
  const { url, appId, restKey } = config();
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": appId,
      "X-Parse-REST-API-Key": restKey,
    },
    body: JSON.stringify({
      articleSlug: input.slug,
      articleId: input.postId,
      userName: input.name,
      userEmail: input.email,
      content: input.message,
      isApproved: false,
      isDeleted: false,
      likes: 0,
      dislikes: 0,
      isReply: false,
      replyCount: 0,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; createdAt?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || "Unable to save comment.");
  return { id: body.objectId, name: input.name, message: input.message, createdAt: body.createdAt ?? null };
}

async function adminQuery(parameters: URLSearchParams): Promise<ParseRecord[]> {
  const { url } = config();
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

export async function getCommentsForModeration(): Promise<ModeratedComment[]> {
  const records = await adminQuery(
    new URLSearchParams({ where: JSON.stringify({ isDeleted: { $ne: true } }), order: "-createdAt", limit: "200" }),
  );
  return records.map((record) => ({
    ...toComment(record),
    slug: textValue(record.articleSlug),
    isApproved: record.isApproved === true,
  }));
}

export async function setCommentApproval(id: string, isApproved: boolean) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid comment id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ isApproved }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}

export async function deleteComment(id: string) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid comment id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ isDeleted: true }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}

export async function createCommentReply(parentId: string, message: string, authorName?: string) {
  const profile = await getProfileSettings();
  const replyAuthor = authorName?.trim() || profile.displayName || FALLBACK_SITE_AUTHOR_NAME;
  if (!OBJECT_ID.test(parentId)) throw new Error("Invalid comment id.");
  const { url } = config();
  const parentResponse = await fetch(`${url}/classes/${COMMENT_CLASS}/${parentId}`, { headers: writeHeaders(), cache: "no-store" });
  const parent = (await parentResponse.json().catch(() => ({}))) as ParseRecord & { error?: string };
  if (!parentResponse.ok || !parent.objectId) throw new Error(parent.error || "That comment no longer exists.");
  if (parent.isApproved !== true) throw new Error("Approve the comment before replying to it.");

  const response = await fetch(`${url}/classes/${COMMENT_CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      articleSlug: parent.articleSlug,
      articleId: parent.articleId,
      parentId,
      userName: replyAuthor,
      content: message,
      isApproved: true,
      isDeleted: false,
      likes: 0,
      dislikes: 0,
      isReply: true,
      replyCount: 0,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; createdAt?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || "Unable to save the reply.");
  return { id: body.objectId, createdAt: body.createdAt ?? null };
}

export function prepareCommentMessage(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return { html: "", text: "" };
  return /<[a-z]/i.test(trimmed) ? sanitizeRichText(trimmed) : { html: plainToRichHtml(trimmed), text: trimmed };
}

export async function voteComment(id: string, direction: "like" | "dislike") {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid comment id.");
  const field = direction === "like" ? "likes" : "dislikes";
  const { url } = config();
  const response = await fetch(`${url}/classes/${COMMENT_CLASS}/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ [field]: { __op: "Increment", amount: 1 } }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
  let updated = (await response.json().catch(() => ({}))) as ParseRecord;
  if (!updated.objectId) {
    const read = await fetch(`${url}/classes/${COMMENT_CLASS}/${id}`, { headers: writeHeaders(), cache: "no-store" });
    updated = (await read.json().catch(() => ({}))) as ParseRecord;
  }
  return { likes: countValue(updated.likes), dislikes: countValue(updated.dislikes) };
}
