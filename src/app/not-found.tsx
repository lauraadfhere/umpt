import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { NOINDEX_ROBOTS, SITE_NAME } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: `Page not found · ${SITE_NAME}`,
  description: "The page you are looking for does not exist or has been moved.",
  robots: NOINDEX_ROBOTS,
};

/**
 * Reached only by addresses outside every locale (for example a missing file). The translated
 * page in [locale]/not-found.tsx handles the rest. There is no locale layout here, so this page
 * brings its own document.
 */
export default function RootNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body className="flex min-h-screen flex-col antialiased">
        <div className="flex min-h-[50px] items-center bg-chrome px-4 text-[13px] font-bold tracking-wide text-white uppercase">UMPT Digital Library</div>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
          <p className="text-[120px] leading-none font-light text-[#c9c9c9]" aria-hidden>
            404
          </p>
          <h1 className="mt-4 text-[30px] leading-[1.2] font-semibold text-text">Page not found</h1>
          <p className="mt-4 max-w-[620px] text-[16px] leading-[1.7] text-text">The page you are looking for does not exist or has been moved.</p>
          <a href={`/${routing.defaultLocale}`} className="mt-8 inline-block bg-link px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-link-hover">
            Go to the home page
          </a>
        </main>
      </body>
    </html>
  );
}
