/** Home category strip — ACM SIG-card layout with UMPT topic labels. */

export type HomeCategory = {
  key: string;
  /** Solid card background (ACM SIG palette style). */
  color: string;
  /** Slightly lighter circle overlay. */
  bubble: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  { key: "technology", color: "#0d7377", bubble: "rgba(255,255,255,0.14)" },
  { key: "entertainment", color: "#1f6feb", bubble: "rgba(255,255,255,0.16)" },
  { key: "science", color: "#1a3a6b", bubble: "rgba(255,255,255,0.12)" },
  { key: "business", color: "#6b3fa0", bubble: "rgba(255,255,255,0.14)" },
  { key: "health", color: "#1e5c45", bubble: "rgba(255,255,255,0.13)" },
  { key: "education", color: "#8b1e3a", bubble: "rgba(255,255,255,0.14)" },
  { key: "arts", color: "#3d5a80", bubble: "rgba(255,255,255,0.15)" },
];
