"use client";

import { useEffect, useState } from "react";

export type SectionLink = { id: string; title: string };

/** A section counts as "being read" once its heading has passed this many pixels from the top of the window. */
const READING_LINE = 140;

/** Table of contents that marks the section currently being read. */
export function SectionsNav({ items, label }: { items: SectionLink[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const page = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= page.scrollHeight - 2;
      let current = items[0]?.id ?? "";
      if (atBottom && window.scrollY > 0) {
        current = items[items.length - 1]?.id ?? current;
      } else {
        for (const item of items) {
          const element = document.getElementById(item.id);
          if (element && element.getBoundingClientRect().top <= READING_LINE) current = item.id;
        }
      }
      setActive(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label={label} className="border-t border-rule px-3 pb-2">
      <ul>
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="border-b border-rule last:border-b-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`flex items-center gap-2 py-2 text-[13px] leading-snug ${isActive ? "font-medium text-text" : "ps-3 text-link hover:underline"}`}
              >
                {isActive && <span className="block h-3.5 w-1 shrink-0 bg-text" aria-hidden />}
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
