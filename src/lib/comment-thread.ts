import type { Comment } from "@/lib/comments";

export function indexCommentsByParent(comments: Comment[]) {
  const byId = new Map(comments.map((item) => [item.id, item]));
  const children = new Map<string, Comment[]>();

  for (const item of comments) {
    if (!item.parentId) continue;
    const list = children.get(item.parentId) ?? [];
    list.push(item);
    children.set(item.parentId, list);
  }

  for (const list of children.values()) {
    list.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  }

  const roots = comments
    .filter((item) => {
      if (!item.parentId) return true;
      return !byId.has(item.parentId);
    })
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  function descendants(id: string): Comment[] {
    return children.get(id) ?? [];
  }

  return { roots, descendants, byId };
}