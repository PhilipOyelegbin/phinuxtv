import { useMemo, useRef } from "react";
import { MovieCard } from "./MovieCard";

export function MovieCarouselSection({ title, movies = [] }) {
  const scrollerRef = useRef(null);

  const canScroll = useMemo(() => movies.length > 0, [movies.length]);

  const scrollByCard = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const amount = Math.max(scroller.clientWidth * 0.8, 320);
    scroller.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!movies.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/10 sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(87,223,186,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,107,61,0.10),transparent_25%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex rounded-full border border-white/10 bg-ink-950/30 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
            Curated collection
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              {title}
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {title}
            </h3>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-white/55">
            Swipe horizontally on mobile or use the arrows to browse the
            collection.
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <button
            type="button"
            onClick={() => scrollByCard("left")}
            disabled={!canScroll}
            className="rounded-full border border-white/10 bg-ink-950/30 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => scrollByCard("right")}
            disabled={!canScroll}
            className="rounded-full border border-white/10 bg-ink-950/30 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="relative z-10 mt-5 flex gap-4 overflow-x-auto scroll-smooth pb-2 pt-1 touch-pan-x snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${title} movie carousel`}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="w-64 shrink-0 snap-start snap-always sm:w-72"
          >
            <MovieCard movie={movie} actions={null} />
          </div>
        ))}
      </div>
    </section>
  );
}
