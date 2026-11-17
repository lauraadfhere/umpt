"use client";

import type { HomePostsAccentSettings } from "@/lib/home-posts-accent-config";
import { HandDrawnAccent } from "@/components/ui/HandDrawnAccent";

const accentClass =
  "pointer-events-none absolute -end-6 top-1/2 h-[min(440px,90%)] w-[min(400px,48vw)] -translate-y-1/2 rtl:-scale-x-100";

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