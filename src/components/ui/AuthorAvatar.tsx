/* eslint-disable @next/next/no-img-element -- avatars come from Parse/R2 or the default CDN */
import { avatarSrc } from "@/lib/avatars";

export function AuthorAvatar({
  name,
  src,
  className = "size-[18px]",
  useDefault = true,
}: {
  name: string;
  src?: string | null;
  className?: string;
  /** When true, show the site default image instead of an icon placeholder. */
  useDefault?: boolean;
}) {
  const resolved = src?.trim() ? src.trim() : useDefault ? avatarSrc() : null;
  if (resolved) {
    return <img src={resolved} alt="" title={name} className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${className} grid shrink-0 place-items-center rounded-full bg-black text-[10px] font-bold text-white`} aria-hidden>
      ?
    </span>
  );
}