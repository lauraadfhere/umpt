type IconProps = { className?: string };

function Svg({ className, children, strokeWidth = 2 }: IconProps & { children: React.ReactNode; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <Svg className={className} strokeWidth={2.4}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.6-4.6" />
    </Svg>
  );
}

export function IconMessage({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" />
    </Svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M0 6h26M21 1l5 5-5 5" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#d6d6d6" />
      <circle cx="12" cy="9.5" r="4" fill="#ffffff" />
      <path d="M4.5 20a8 8 0 0 1 15 0" fill="#ffffff" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

/** Type / reading options (sliders). */
export function IconReadingOptions({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h10M4 12h16M4 17h7" />
      <circle cx="17" cy="7" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="13" cy="12" r="2.25" fill="currentColor" stroke="none" />
      <circle cx="15" cy="17" r="2.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGear({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm9 2.2-2-.4a7 7 0 0 0-.8-1.9l1.2-1.7-1.6-1.6-1.7 1.2a7 7 0 0 0-1.9-.8L13.8 3h-2.2l-.4 2a7 7 0 0 0-1.9.8L7.6 4.6 6 6.2l1.2 1.7a7 7 0 0 0-.8 1.9L4.4 10v2.2l2 .4c.2.7.4 1.3.8 1.9l-1.2 1.7 1.6 1.6 1.7-1.2c.6.4 1.2.6 1.9.8l.4 2h2.2l.4-2c.7-.2 1.3-.4 1.9-.8l1.7 1.2 1.6-1.6-1.2-1.7c.4-.6.6-1.2.8-1.9l2-.4V10.7z" />
    </svg>
  );
}

export function IconRss({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="19" r="3" />
      <path d="M2 9v4a9 9 0 0 1 9 9h4A13 13 0 0 0 2 9z" />
      <path d="M2 2v4a16 16 0 0 1 16 16h4A20 20 0 0 0 2 2z" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 6.5 12 13l10-6.5V5H2z" />
      <path d="M2 8.9V19h20V8.9l-10 6.5z" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </Svg>
  );
}

export function IconPosts({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Svg>
  );
}

export function IconPages({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 12h6M10 16h6" />
    </Svg>
  );
}

export function IconBrand({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" />
    </Svg>
  );
}

export function IconStar({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <Svg className={className} strokeWidth={filled ? 1.5 : 2}>
      <path
        d="M12 2.5l2.55 5.9 6.4.55-4.85 4.2 1.5 6.25L12 16.9 6.4 19.6l1.5-6.25-4.85-4.2 6.4-.55L12 2.5z"
        fill={filled ? "currentColor" : "none"}
      />
    </Svg>
  );
}
