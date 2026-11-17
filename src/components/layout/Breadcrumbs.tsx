import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-[1200px] px-6 pt-5 pb-4 text-[13px] italic">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text" aria-hidden>&gt;</span>}
            {item.href ? (
              <Link href={item.href} className="text-muted hover:text-link hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-text" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
