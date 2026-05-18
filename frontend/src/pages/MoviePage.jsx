import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { useMovieStore } from "../store/useMovieStore";

export function MoviePage() {
  const { id } = useParams();
  const movie = useMovieStore((state) => state.movie);
  const recommendations = useMovieStore((state) => state.recommendations);
  const isLoading = useMovieStore((state) => state.isLoading);
  const loadMovie = useMovieStore((state) => state.loadMovie);
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const toggleLike = useMovieStore((state) => state.toggleLike);
  const watchMovie = useMovieStore((state) => state.watchMovie);

  useEffect(() => {
    loadMovie(id);
  }, [id, loadMovie]);

  const isEmbedUrl =
    typeof movie?.streamUrl === "string" &&
    movie.streamUrl.includes("vidsrc-embed.ru/embed/movie/");

  if (isLoading || !movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-white/60 sm:px-6 lg:px-8">
        Loading movie...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <div className="glass overflow-hidden rounded-[32px] border-white/10">
            {isEmbedUrl ? (
              <iframe
                className="aspect-video w-full bg-black"
                src={movie.streamUrl}
                title={`${movie.title} player`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() =>
                  watchMovie(movie.id, {
                    progressSeconds: 0,
                    completed: false,
                  })
                }
              />
            ) : (
              <video
                className="aspect-video w-full bg-black"
                controls
                poster={movie.posterUrl}
                src={movie.streamUrl}
                onPlay={() =>
                  watchMovie(movie.id, {
                    progressSeconds: 0,
                    completed: false,
                  })
                }
              />
            )}
            <div className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/45">
                <span>{movie.genre}</span>
                <span>{movie.releaseYear}</span>
                <span>{movie.durationMinutes} min</span>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-5xl">
                    {movie.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
                    {movie.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Rating
                  </div>
                  <div className="text-2xl font-bold text-mint-300">
                    {movie.rating}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => toggleFavorite(movie)}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${movie.isFavorite ? "bg-mint-400 text-ink-950" : "bg-white/10 text-white hover:bg-white/15"}`}
                >
                  {movie.isFavorite ? "Remove favorite" : "Add favorite"}
                </button>
                <button
                  onClick={() => toggleLike(movie)}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${movie.isLiked ? "bg-ember-500 text-white" : "bg-white/10 text-white hover:bg-white/15"}`}
                >
                  {movie.isLiked ? "Liked" : "Like movie"}
                </button>
                <button
                  onClick={() =>
                    watchMovie(movie.id, {
                      progressSeconds: 0,
                      completed: true,
                    })
                  }
                  className="rounded-2xl bg-gradient-to-r from-mint-400 to-ember-500 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:brightness-110"
                >
                  Mark as watched
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="glass rounded-[32px] border-white/10 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              Cast & Crew
            </div>
            <div className="mt-4 space-y-4 text-sm text-white/70">
              <div>
                <span className="text-white">Director:</span> {movie.director}
              </div>
              <div>
                <span className="text-white">Cast:</span>{" "}
                {movie.cast?.join(", ")}
              </div>
              <div>
                <span className="text-white">Tags:</span>{" "}
                {movie.tags?.join(", ")}
              </div>
            </div>
          </div>
          <div className="glass rounded-[32px] border-white/10 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              Similar Movies
            </div>
            <div className="mt-4 space-y-4">
              {recommendations.map((item) => (
                <MovieCard key={item.id} movie={item} actions={null} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
