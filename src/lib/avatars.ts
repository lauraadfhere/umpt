/** Shown for readers and commenters who have not uploaded a profile photo. */
export const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRajImR-RgJoyx7BsE9iCTT5EJCjA0fOqv-R8RvTnNemg&s";

export function avatarSrc(url?: string | null) {
  const trimmed = typeof url === "string" ? url.trim() : "";
  return trimmed || DEFAULT_AVATAR_URL;
}