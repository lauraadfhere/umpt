export type NavKey = "journals" | "blogs" | "proceedings" | "books" | "sigs" | "conferences" | "institutions" | "people";

/** Main categories, shared by the header and the footer. */
export const NAV: { key: NavKey; href: string }[] = [
  { key: "journals", href: "/posts" },
  { key: "blogs", href: "/blogs" },
  { key: "proceedings", href: "/proceedings" },
  { key: "books", href: "/books" },
  { key: "sigs", href: "/proceedings" },
  { key: "conferences", href: "/proceedings" },
  { key: "institutions", href: "/people" },
  { key: "people", href: "/people" },
];
