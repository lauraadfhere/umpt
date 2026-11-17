import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "umpt_reader";
const SESSION_DAYS = 365;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function secret() {
  return process.env.READER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "umpt-reader-dev";
}

export type ReaderSession = {
  email: string;
  displayName: string;
};

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]?.replace(/[._+-]+/g, " ").trim() || "Reader";
  return local.replace(/\b\w/g, (char) => char.toUpperCase()).slice(0, 80);
}

export function normaliseReaderEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!email || email.length > 120 || !EMAIL.test(email)) return null;
  return email;
}

function encodeSession(session: ReaderSession) {
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const body = JSON.stringify({ e: session.email, n: session.displayName, x: expires });
  const encoded = Buffer.from(body, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(token?: string | null): ReaderSession | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { e?: string; n?: string; x?: string };
    if (!parsed.e || !parsed.x || Number(parsed.x) < Date.now()) return null;
    const email = normaliseReaderEmail(parsed.e);
    if (!email) return null;
    const displayName = typeof parsed.n === "string" && parsed.n.trim() ? parsed.n.trim().slice(0, 80) : displayNameFromEmail(email);
    return { email, displayName };
  } catch {
    return null;
  }
}

export async function getReaderSession(): Promise<ReaderSession | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

export async function startReaderSession(emailInput: string): Promise<ReaderSession> {
  const email = normaliseReaderEmail(emailInput);
  if (!email) throw new Error("Enter a valid email address.");
  const session: ReaderSession = { email, displayName: displayNameFromEmail(email) };
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return session;
}

export async function endReaderSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}