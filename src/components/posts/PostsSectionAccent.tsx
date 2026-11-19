"use client";

import type { HomePostsAccentSettings } from "@/lib/home-posts-accent-config";
import { HandDrawnAccent } from "@/components/ui/HandDrawnAccent";

const accentClass =
  "pointer-events-none absolute end-12 top-1/2 hidden h-[min(400px,88%)] w-[min(360px,40vw)] -translate-y-1/2 sm:end-14 md:block lg:end-20 xl:end-24 rtl:-scale-x-100";

/** Decorative image on the right of the home UMPT Posts band. */
export function PostsSectionAccent({ accent }: { accent: HomePostsAccentSettings }) {
  if (accent.mode === "image" && accent.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={accent.imageUrl}
        alt={accent.alt}
        className={`${accentClass} object-contain`}
        style={{ opacity: accent.opacity / 100 }}
      />
    );
  }
  return <HandDrawnAccent className={accentClass} />;
}