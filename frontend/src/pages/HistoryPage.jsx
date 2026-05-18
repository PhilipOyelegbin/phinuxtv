import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMovieStore } from "../store/useMovieStore";

export function HistoryPage() {
  const history = useMovieStore((state) => state.history);
  const loadHistory = useMovieStore((state) => state.loadHistory);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">
            History
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Recently watched
          </h1>
        </div>
        <Link
          to="/"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
        >
          Back to catalog
        </Link>
      </div>
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="glass rounded-[28px] border-white/10 p-8 text-white/60">
            Nothing watched yet. Start a movie to create history.
          </div>
        ) : (
          history.map((entry) => (
            <article
              key={entry.id}
              className="glass flex flex-col gap-4 rounded-[28px] border-white/10 p-4 sm:flex-row sm:items-center"
            >
              <img
                src={entry.movie.posterUrl}
                alt={entry.movie.title}
                className="h-24 w-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {entry.movie.title}
                    </h2>
                    <p className="text-sm text-white/55">
                      {entry.movie.genre} · {entry.movie.releaseYear}
                    </p>
                  </div>
                  <Link
                    to={`/movie/${entry.movie.id}`}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/15"
                  >
                    Open
                  </Link>
                </div>
                <div className="mt-3 text-sm text-white/60">
                  Watched {new Date(entry.watchedAt).toLocaleString()} ·{" "}
                  {entry.completed
                    ? "Completed"
                    : `Progress ${entry.progressSeconds}s`}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
