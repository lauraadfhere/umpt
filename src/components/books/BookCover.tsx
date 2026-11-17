/* eslint-disable @next/next/no-img-element -- covers come from arbitrary Parse/R2 hosts */

const palettes = [
  ["#0b3a5c", "#1d6fa3"],
  ["#1f2a44", "#3d5a80"],
  ["#2d2d2d", "#5a5a5a"],
  ["#0f4c4c", "#2a8a8a"],
];

function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

export function BookCover({ title, cover, isNew, newLabel, className = "" }: { title: string; cover?: string; isNew?: boolean; newLabel: string; className?: string }) {
  const [from, to] = palettes[hash(title) % palettes.length];

  return (
    <div className={`relative shrink-0 ${className}`}>
      {cover ? (
        <img src={cover} alt="" className="h-full w-full object-cover shadow-[0_1px_3px_rgba(0,0,0,0.25)]" loading="lazy" />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between p-2 text-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
          style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
          aria-hidden
        >
          <span className="line-clamp-4 text-[10px] leading-tight font-semibold">{title}</span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-white/80" />
            <span className="h-px flex-1 bg-white/50" />
          </span>
        </div>
      )}
      {isNew && (
        <span className="absolute -top-1.5 -start-1.5 bg-new px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
          {newLabel}
        </span>
      )}
    </div>
  );
}
