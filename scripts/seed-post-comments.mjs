/**
 * Seed approved mock comments via Parse (uses .env.local PARSE_* vars).
 * Usage:
 *   node scripts/seed-post-comments.mjs              # all published posts → 3 roots each
 *   node scripts/seed-post-comments.mjs my-post-slug   # one post
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TARGET = 3;

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnv();

const PARSE_URL = (process.env.PARSE_SERVER_URL || process.env.NEXT_PUBLIC_PARSE_SERVER_URL || "").replace(/\/$/, "");
const APP_ID = process.env.PARSE_APP_ID || process.env.NEXT_PUBLIC_PARSE_APP_ID;
const REST_KEY = process.env.PARSE_REST_KEY;
const MASTER_KEY = process.env.PARSE_MASTER_KEY;

if (!PARSE_URL || !APP_ID || !(MASTER_KEY || REST_KEY)) {
  console.error("Missing PARSE_* environment variables.");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "X-Parse-Application-Id": APP_ID,
  ...(MASTER_KEY ? { "X-Parse-Master-Key": MASTER_KEY } : { "X-Parse-REST-API-Key": REST_KEY }),
};

const GENERIC_NAMES = ["Priya Nair", "Theo Bergmann", "Yuki Tanaka"];

async function parseQuery(className, params) {
  const response = await fetch(`${PARSE_URL}/classes/${className}?${params}`, { headers, cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || response.statusText);
  return body.results ?? [];
}

async function listPosts() {
  const POST_CLASSES = ["Article", "BlogPost", "Note"];
  const posts = [];
  for (const className of POST_CLASSES) {
    const rows = await parseQuery(className, new URLSearchParams({ where: JSON.stringify({ status: "published" }), limit: "200" }));
    for (const row of rows) {
      if (row.slug && row.objectId) posts.push({ slug: row.slug, id: row.objectId, title: row.title || row.slug });
    }
  }
  const bySlug = new Map();
  for (const post of posts) bySlug.set(post.slug, post);
  return [...bySlug.values()];
}

async function findPost(slug) {
  const POST_CLASSES = ["Article", "BlogPost", "Note"];
  for (const className of POST_CLASSES) {
    const rows = await parseQuery(className, new URLSearchParams({ where: JSON.stringify({ slug }), limit: "1" }));
    if (rows[0]?.objectId) {
      return { slug, id: rows[0].objectId, title: rows[0].title || slug };
    }
  }
  return null;
}

async function rootCommentCount(slug) {
  const existing = await parseQuery(
    "Comment",
    new URLSearchParams({
      where: JSON.stringify({
        articleSlug: slug,
        isApproved: true,
        isReply: { $ne: true },
        isDeleted: { $ne: true },
      }),
      limit: "100",
    }),
  );
  return existing.length;
}

function draftsForPost(post) {
  const title = String(post.title || post.slug);
  const key = title.toLowerCase();
  if (key.includes("cybersecurity") || key.includes("intelligent-threat")) {
    return [
      { name: "Rachel Morrison", message: "AI-driven phishing section matches what our SOC sees weekly.", likes: 8, dislikes: 0 },
      { name: "Dev Patel", message: "Purple-team against fine-tuned models exposed gaps our IDS missed.", likes: 5, dislikes: 1 },
      { name: "Ingrid Solberg", message: "Clear split between offensive AI misuse and defensive ML.", likes: 4, dislikes: 0 },
    ];
  }
  return GENERIC_NAMES.map((name, index) => ({
    name,
    message: `Comment ${index + 1} on “${title}” — useful overview for our reading group.`,
    likes: 1 + index,
    dislikes: 0,
  }));
}

async function seedPost(post) {
  const drafts = draftsForPost(post).slice(0, TARGET);
  const existing = await rootCommentCount(post.slug);
  if (existing >= TARGET) {
    console.log(`Skip ${post.slug}: already has ${existing} root comment(s).`);
    return 0;
  }
  const toCreate = drafts.slice(existing);
  for (const draft of toCreate) {
    const response = await fetch(`${PARSE_URL}/classes/Comment`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        articleSlug: post.slug,
        articleId: post.id,
        userName: draft.name,
        content: draft.message,
        isApproved: true,
        isDeleted: false,
        likes: draft.likes,
        dislikes: draft.dislikes,
        isReply: false,
        replyCount: 0,
      }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || response.statusText);
    console.log(`  + ${post.slug}: ${draft.name}`);
  }
  return toCreate.length;
}

async function main() {
  const arg = process.argv[2];
  const posts = arg ? [await findPost(arg)] : await listPosts();
  const targets = posts.filter(Boolean);
  if (!targets.length) {
    console.error(arg ? `Post not found: ${arg}` : "No published posts found.");
    process.exit(1);
  }

  let created = 0;
  for (const post of targets) {
    created += await seedPost(post);
  }
  console.log(`Done. Added ${created} comment(s) across ${targets.length} post(s) (target ${TARGET} roots each).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});