export type DashboardTab =
  | "overview"
  | "posts"
  | "books"
  | "projects"
  | "pages"
  | "comments"
  | "reviews"
  | "contacts"
  | "subscribers"
  | "profile"
  | "logo"
  | "favicon"
  | "home"
  | "uploads";

export const DASHBOARD_TABS: { key: DashboardTab; href: string }[] = [
  { key: "overview", href: "/dashboard" },
  { key: "posts", href: "/dashboard/posts" },
  { key: "books", href: "/dashboard/books" },
  { key: "projects", href: "/dashboard/projects" },
  { key: "pages", href: "/dashboard/pages" },
  { key: "comments", href: "/dashboard/comments" },
  { key: "reviews", href: "/dashboard/reviews" },
  { key: "contacts", href: "/dashboard/contacts" },
  { key: "subscribers", href: "/dashboard/subscribers" },
  { key: "profile", href: "/dashboard/profile" },
  { key: "logo", href: "/dashboard/logo" },
  { key: "favicon", href: "/dashboard/favicon" },
  { key: "home", href: "/dashboard/home" },
  { key: "uploads", href: "/dashboard/uploads" },
];
