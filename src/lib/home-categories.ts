/** ACM SIG–style category cards for the home carousel and /categories page. */

export type HomeCategory = {
  key: "technology" | "entertainment" | "science" | "business" | "health" | "education" | "arts";
  color: string;
  /** Soft circle overlay color on the card. */
  bubble: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  { key: "technology", color: "#1a6fb0", bubble: "rgba(255,255,255,0.18)" },
  { key: "entertainment", color: "#c4122f", bubble: "rgba(255,255,255,0.16)" },
  { key: "science", color: "#5a3d8a", bubble: "rgba(255,255,255,0.16)" },
  { key: "business", color: "#0f6b4c", bubble: "rgba(255,255,255,0.15)" },
  { key: "health", color: "#b84a1f", bubble: "rgba(255,255,255,0.16)" },
  { key: "education", color: "#1c4a8a", bubble: "rgba(255,255,255,0.18)" },
  { key: "arts", color: "#7a3d6b", bubble: "rgba(255,255,255,0.16)" },
];

export function getHomeCategory(key: string): HomeCategory | undefined {
  return HOME_CATEGORIES.find((item) => item.key === key);
}