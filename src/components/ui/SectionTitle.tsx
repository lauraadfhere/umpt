type Size = "lg" | "md" | "sm";

type Props = {
  children: React.ReactNode;
  as?: "h2" | "h3" | "p";
  size?: Size;
  /** "accent" draws the purple bar used on reading pages. */
  tone?: "default" | "accent";
  className?: string;
};

const text: Record<Size, string> = {
  lg: "text-[21px] font-medium",
  md: "text-[17px] font-semibold",
  sm: "text-[15px] font-semibold",
};

const bar: Record<Size, string> = {
  lg: "h-[18px] w-[6px]",
  md: "h-[16px] w-[5px]",
  sm: "h-[14px] w-[5px]",
};

export function SectionTitle({ children, as: Tag = "h2", size = "lg", tone = "default", className = "" }: Props) {
  return (
    <Tag className={`flex items-center gap-2 leading-tight italic text-text ${text[size]} ${className}`}>
      <span className={`block shrink-0 ${bar[size]} ${tone === "accent" ? "bg-accent" : "bg-text"}`} aria-hidden />
      {children}
    </Tag>
  );
}

export function Panel({ title, children, className = "" }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-panel ${className}`}>
      <div className="bg-panel-head px-3 py-2.5">
        <SectionTitle>{title}</SectionTitle>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}
