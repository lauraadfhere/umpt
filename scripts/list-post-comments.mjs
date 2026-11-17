import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of raw.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  process.env[match[1]] = value;
}

const slug = process.argv[2] || "cybersecurity-in-the-age-of-ai-defending-against-intelligent-threats";
const url = process.env.PARSE_SERVER_URL;
const headers = {
  "X-Parse-Application-Id": process.env.PARSE_APP_ID,
  ...(process.env.PARSE_MASTER_KEY
    ? { "X-Parse-Master-Key": process.env.PARSE_MASTER_KEY }
    : { "X-Parse-REST-API-Key": process.env.PARSE_REST_KEY }),
};

async function list(where, label) {
  const params = new URLSearchParams({
    where: JSON.stringify(where),
    limit: "100",
    order: "-createdAt",
  });
  const response = await fetch(`${url}/classes/Comment?${params}`, { headers });
  const body = await response.json();
  const rows = body.results ?? [];
  console.log(`Found ${rows.length} ${label} for ${slug}`);
  return rows;
}

const approved = await list({ articleSlug: slug, isApproved: true, isDeleted: { $ne: true } }, "approved comments");
const all = await list({ articleSlug: slug, isDeleted: { $ne: true } }, "total comments");
const rows = approved.length ? approved : all;
for (const row of rows.slice(0, 8)) {
  console.log("-", row.userName || row.author, "·", String(row.content).slice(0, 70));
}