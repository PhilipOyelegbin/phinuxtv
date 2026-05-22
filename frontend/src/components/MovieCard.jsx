import { Link } from "react-router-dom";

export function MovieCard({ movie, actions }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-mint-300/30">
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80">
            {movie.genre}
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
              {movie.releaseYear}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
            {movie.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/55">
          <span className="rounded-full bg-white/8 px-3 py-1">
            {movie.durationMinutes} min
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1">
            {movie.rating} rating
          </span>
          <span
            className={`rounded-full px-3 py-1 ${movie.isFavorite ? "bg-mint-400/20 text-mint-300" : "bg-white/8"}`}
          >
            {movie.isFavorite ? "Saved" : "Not saved"}
          </span>
        </div>
        {actions}
      </div>
    </article>
  );
}
