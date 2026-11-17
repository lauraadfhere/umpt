/** Light hand-drawn star and doodles for section backgrounds (home posts band, etc.). */
export function HandDrawnAccent({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none text-[#e4e4e4] ${className}`}
      viewBox="0 0 400 420"
      fill="none"
      aria-hidden
    >
      <path
        d="M198 36c78-6 142 38 152 118s-32 156-108 176-158-26-174-104 36-172 130-190"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M200 78
           L213 168 L305 172 L238 222 L268 312
           L200 262 L132 312 L162 222 L95 172 L187 168 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M200 96
           L209 154 L268 157 L228 198 L248 272
           L200 238 L152 272 L172 198 L132 157 L191 154 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.32"
      />
      <path d="M292 108c20 6 32 26 24 44" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.38" />
      <path d="M88 218c-16 10-22 30-14 48" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.38" />
      <path d="M318 292c10 18 28 26 46 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      <path d="M120 92c-12-14-8-34 6-44M330 240c14-6 32-2 40 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.28" />
      <circle cx="324" cy="86" r="2.2" fill="currentColor" opacity="0.35" />
      <circle cx="76" cy="298" r="1.8" fill="currentColor" opacity="0.3" />
      <path d="M248 52l8 14M142 360l-10 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}