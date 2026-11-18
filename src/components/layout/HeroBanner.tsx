/* eslint-disable @next/next/no-img-element -- hero background may be Parse/R2 URLs */
import { IconSearch } from "@/components/ui/Icons";
import { DEFAULT_HERO_CONTEXT, type HeroContextSettings } from "@/lib/hero-context-config";
import { heroBackgroundFilterCss } from "@/lib/hero-image-filters";
import { HeroContextPanel } from "@/components/reading/HeroContextPanel";

type Props = {
  title: string;
  search?: { action: string; placeholder: string; defaultValue?: string };
  context?: HeroContextSettings | null;
};

function HeroArt() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 180" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" strokeLinecap="round">
        <path d="M-40 230 L230 -40" stroke="#7b7b7b" strokeWidth="70" />
        <path d="M120 230 L330 20 L540 230" stroke="#7a7a7a" strokeWidth="46" />
        <path d="M430 -60 L640 150 L850 -60" stroke="#7d7d7d" strokeWidth="58" />
        <path d="M760 240 L980 20 L1200 240" stroke="#7b7b7b" strokeWidth="64" />
        <path d="M1010 -40 L1260 210" stroke="#7e7e7e" strokeWidth="40" />
        <path d="M600 260 L820 40" stroke="#686868" strokeWidth="6" />
        <path d="M250 -20 L470 200" stroke="#686868" strokeWidth="5" />
      </g>
    </svg>
  );
}

export function HeroBanner({ title, search, context }: Props) {
  const hero = context ?? DEFAULT_HERO_CONTEXT;
  const displayTitle = hero.titleOverride?.trim() || title;
  const overlayPct = hero.overlayOpacity;
  const useImage = hero.backgroundMode === "image" && hero.backgroundImageUrl;
  const tiled = useImage && hero.backgroundFit === "tile";
  const imageFilter = useImage ? heroBackgroundFilterCss(hero) : undefined;

  return (
    <div className="relative overflow-hidden bg-hero text-white">
      {useImage ? (
        <div
          className="pointer-events-none absolute inset-0 scale-[1.02]"
          style={{
            backgroundImage: `url(${hero.backgroundImageUrl})`,
            backgroundSize: tiled ? "180px 180px" : "cover",
            backgroundRepeat: tiled ? "repeat" : "no-repeat",
            backgroundPosition: "center",
            filter: imageFilter,
          }}
          aria-hidden
        />
      ) : (
        <HeroArt />
      )}
      {useImage ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(100deg, rgba(0,0,0,${overlayPct * 0.009}) 0%, rgba(0,0,0,${overlayPct * 0.004}) 42%, rgba(0,0,0,${overlayPct * 0.0065}) 100%)`,
          }}
          aria-hidden
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: overlayPct / 100 }} aria-hidden />
      )}
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 md:min-h-[122px] md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-[34px] font-semibold tracking-[0.01em] [text-shadow:0_1px_3px_rgba(0,0,0,0.55),0_0_24px_rgba(0,0,0,0.35)] md:text-[40px]">{displayTitle}</h1>
          {hero.showContextPanel && hero.contextHtml ? (
            <HeroContextPanel html={hero.contextHtml} panelOpacity={hero.panelOpacity} />
          ) : null}
        </div>
        {search && (
          <form action={search.action} role="search" className="flex h-[42px] w-full max-w-[480px] shrink-0 items-center bg-white shadow-md">
            <label className="sr-only" htmlFor="hero-search">
              {search.placeholder}
            </label>
            <input
              id="hero-search"
              name="q"
              type="search"
              defaultValue={search.defaultValue}
              placeholder={search.placeholder}
              className="h-full flex-1 bg-transparent px-3 text-[15px] text-text outline-none placeholder:italic placeholder:text-[#9a9a9a]"
            />
            <button type="submit" className="grid h-full w-11 place-items-center text-[#888] hover:text-text" aria-label={search.placeholder}>
              <IconSearch className="size-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}