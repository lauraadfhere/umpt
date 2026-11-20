import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  // Skip API, Next internals, extensioned static files, and /site-icon (no extension —
  // otherwise next-intl redirects it to /en/site-icon and the favicon never loads).
  matcher: ["/((?!api|_next|_vercel|site-icon|.*\\..*).*)"],
};
