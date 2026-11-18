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
  | "heroContext"
  | "uploads";

export const DASHBOARD_TAB_PATHS: Record<DashboardTab, string> = {
  overview: "/dashboard",
  posts: "/dashboard/posts",
  books: "/dashboard/books",
  projects: "/dashboard/projects",
  pages: "/dashboard/pages",
  comments: "/dashboard/comments",
  reviews: "/dashboard/reviews",
  contacts: "/dashboard/contacts",
  subscribers: "/dashboard/subscribers",
  profile: "/dashboard/profile",
  logo: "/dashboard/logo",
  favicon: "/dashboard/favicon",
  home: "/dashboard/home",
  heroContext: "/dashboard/hero-context",
  uploads: "/dashboard/uploads",
};

/** Flat list (overview, modules, settings) — used where a full tab list is needed. */
export const DASHBOARD_TABS: { key: DashboardTab; href: string }[] = (
  Object.entries(DASHBOARD_TAB_PATHS) as [DashboardTab, string][]
).map(([key, href]) => ({ key, href }));

export const DASHBOARD_PRIMARY_TABS: DashboardTab[] = ["overview", "posts", "books", "projects", "pages"];

export const DASHBOARD_INBOX_TABS: DashboardTab[] = ["comments", "reviews", "contacts", "subscribers"];

export const DASHBOARD_SETTINGS_TABS: DashboardTab[] = ["profile", "logo", "favicon", "home", "heroContext", "uploads"];

export function isDashboardSettingsTab(tab: DashboardTab): boolean {
  return DASHBOARD_SETTINGS_TABS.includes(tab);
}
