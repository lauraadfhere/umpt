const BARS = 10;
const OPACITY = [1, 1, 0.82, 0.72, 0.6, 0.52, 0.42, 0.32, 0.22, 0.14];

type Props = {
  size?: number;
  /** Announced to screen readers. Omit when visible text already says what is loading. */
  label?: string;
  className?: string;
};

/** Ring of ten slanted bars fading from black to light grey, stepping clockwise. */
export function Loader({ size = 44, label, className = "" }: Props) {
  return (
    <span role={label ? "status" : undefined} aria-hidden={label ? undefined : true} className={`inline-flex shrink-0 text-[#111] ${className}`}>
      <svg className="loader-spin" width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        {Array.from({ length: BARS }, (_, index) => (
          <rect
            key={index}
            x="36"
            y="11.25"
            width="28"
            height="5.5"
            rx="2.75"
            fill="currentColor"
            opacity={OPACITY[(BARS - index) % BARS]}
            transform={`rotate(${index * (360 / BARS)} 50 50) rotate(-20 50 14)`}
          />
        ))}
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
