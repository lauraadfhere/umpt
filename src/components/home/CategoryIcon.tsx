/** Simple white icons for home category cards (ACM SIG logo slot). */

export function CategoryIcon({ categoryKey, className = "" }: { categoryKey: string; className?: string }) {
  const common = `fill-none stroke-current ${className}`;
  switch (categoryKey) {
    case "technology":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <rect x="10" y="14" width="44" height="30" rx="3" />
          <path d="M24 52h16M32 44v8" strokeLinecap="round" />
          <path d="M22 26h20M22 34h12" strokeLinecap="round" />
        </svg>
      );
    case "entertainment":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <circle cx="32" cy="32" r="20" />
          <path d="M28 22v20l16-10z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "science":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <circle cx="32" cy="32" r="6" fill="currentColor" stroke="none" />
          <ellipse cx="32" cy="32" rx="22" ry="10" transform="rotate(0 32 32)" />
          <ellipse cx="32" cy="32" rx="22" ry="10" transform="rotate(60 32 32)" />
          <ellipse cx="32" cy="32" rx="22" ry="10" transform="rotate(120 32 32)" />
        </svg>
      );
    case "business":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <path d="M12 52V28h12v24M28 52V16h16v36M48 52V34h12v18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "health":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <path d="M32 52s-18-12-18-26a10 10 0 0 1 18-6 10 10 0 0 1 18 6c0 14-18 26-18 26z" strokeLinejoin="round" />
        </svg>
      );
    case "education":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <path d="M8 28 L32 16l24 12-24 12L8 28z" strokeLinejoin="round" />
          <path d="M16 32v12c0 4 16 8 16 8s16-4 16-8V32" strokeLinecap="round" />
          <path d="M56 28v16" strokeLinecap="round" />
        </svg>
      );
    case "arts":
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <circle cx="22" cy="26" r="8" />
          <circle cx="40" cy="22" r="7" />
          <circle cx="44" cy="38" r="8" />
          <circle cx="26" cy="42" r="7" />
          <circle cx="32" cy="32" r="5" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className={common} strokeWidth="2.2" aria-hidden>
          <circle cx="32" cy="32" r="18" />
        </svg>
      );
  }
}