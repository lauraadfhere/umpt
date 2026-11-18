"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import {
  DASHBOARD_INBOX_TABS,
  DASHBOARD_PRIMARY_TABS,
  DASHBOARD_SETTINGS_TABS,
  DASHBOARD_TAB_PATHS,
  isDashboardSettingsTab,
  type DashboardTab,
} from "@/lib/dashboard-nav";

type Props = { active: DashboardTab };

const barClass =
  "sticky top-[var(--sticky-subnav-top)] z-[55] bg-subnav text-white shadow-[0_2px_6px_rgba(0,0,0,0.12)] supports-[backdrop-filter]:bg-[#2e2e2e]/96 supports-[backdrop-filter]:backdrop-blur-sm";

function TabLink({ tab, active, label }: { tab: DashboardTab; active: boolean; label: string }) {
  return (
    <Link
      href={DASHBOARD_TAB_PATHS[tab]}
      aria-current={active ? "page" : undefined}
      className={`block min-h-11 touch-manipulation px-3 py-3 text-[13px] font-medium sm:px-3.5 ${active ? "bg-subnav-active text-white" : "text-white/92 hover:bg-white/12"}`}
    >
      {label}
    </Link>
  );
}

export function DashboardSubNav({ active }: Props) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsActive = isDashboardSettingsTab(active);

  useEffect(() => {
    if (!settingsOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setSettingsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  return (
    <nav className={barClass} aria-label={tNav("section")}>
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-stretch justify-center gap-x-0.5 px-1">
        {DASHBOARD_PRIMARY_TABS.map((tab) => (
          <TabLink key={tab} tab={tab} active={tab === active} label={t(`tabs.${tab}`)} />
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-white/20 sm:block" aria-hidden />
        {DASHBOARD_INBOX_TABS.map((tab) => (
          <TabLink key={tab} tab={tab} active={tab === active} label={t(`tabs.${tab}`)} />
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-white/20 sm:block" aria-hidden />
        <div ref={root} className="relative flex items-stretch">
          <button
            type="button"
            className={`flex min-h-11 touch-manipulation items-center gap-1.5 px-3 py-3 text-[13px] font-medium sm:px-3.5 ${
              settingsActive || settingsOpen ? "bg-subnav-active text-white" : "text-white/92 hover:bg-white/12"
            }`}
            aria-expanded={settingsOpen}
            aria-controls={menuId}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {t("tabs.settings")}
            <span className="text-[10px] opacity-80" aria-hidden>
              ▾
            </span>
          </button>
          {settingsOpen ? (
            <ul
              id={menuId}
              className="absolute end-0 top-full z-[60] mt-0 min-w-[13.5rem] border border-white/15 bg-[#2a2a2a] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:start-0 sm:end-auto"
              role="menu"
            >
              {DASHBOARD_SETTINGS_TABS.map((tab) => (
                <li key={tab} role="none">
                  <Link
                    href={DASHBOARD_TAB_PATHS[tab]}
                    role="menuitem"
                    className={`block px-4 py-2.5 text-[13px] ${tab === active ? "bg-white/12 font-semibold text-white" : "text-white/90 hover:bg-white/10"}`}
                    onClick={() => setSettingsOpen(false)}
                  >
                    {t(`tabs.${tab}`)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </nav>
  );
}