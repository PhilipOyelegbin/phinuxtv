import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { api } from "../api/client";
import { useMovieStore } from "../store/useMovieStore";

export function TVSeriesDetailPage() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const toggleLike = useMovieStore((state) => state.toggleLike);
  const watchMovie = useMovieStore((state) => state.watchMovie);

  useEffect(() => {
    async function loadSeries() {
      setIsLoading(true);
      setError("");

      try {
        const [{ movie }, { movies }] = await Promise.all([
          api.tvSeriesItem(id),
          api.recommendations(id),
        ]);

        setSeries(movie);
        setRecommendations(movies || []);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSeries();

    return undefined;
  }, [id]);

  const isEmbedUrl =
    typeof series?.streamUrl === "string" &&
    series.streamUrl.includes("vidsrc-embed.ru/embed/tv/");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-white/60 sm:px-6 lg:px-8">
        Loading TV series...
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-white/60 sm:px-6 lg:px-8">
        {error || "TV series not found."}
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
                src={series.streamUrl}
                title={`${series.title} player`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() =>
                  watchMovie(series.id, {
                    progressSeconds: 0,
                    completed: false,
                  })
                }
              />
            ) : (
              <video
                className="aspect-video w-full bg-black"
                controls
                poster={series.posterUrl}
                src={series.streamUrl}
                onPlay={() =>
                  watchMovie(series.id, {
                    progressSeconds: 0,
                    completed: false,
                  })
                }
              />
            )}
            <div className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/45">
                <span>{series.genre}</span>
                <span>{series.releaseYear}</span>
                <span>{series.durationMinutes || "TV"} min</span>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-5xl">
                    {series.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
                    {series.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                    Rating
                  </div>
                  <div className="text-2xl font-bold text-mint-300">
                    {series.rating}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    await toggleFavorite(series);
                    setSeries((current) =>
                      current
                        ? { ...current, isFavorite: !current.isFavorite }
                        : current,
                    );
                  }}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${series.isFavorite ? "bg-mint-400 text-ink-950" : "bg-white/10 text-white hover:bg-white/15"}`}
                >
                  {series.isFavorite ? "Remove favorite" : "Add favorite"}
                </button>
                <button
                  onClick={async () => {
                    await toggleLike(series);
                    setSeries((current) =>
                      current
                        ? { ...current, isLiked: !current.isLiked }
                        : current,
                    );
                  }}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${series.isLiked ? "bg-ember-500 text-white" : "bg-white/10 text-white hover:bg-white/15"}`}
                >
                  {series.isLiked ? "Liked" : "Like series"}
                </button>
                <button
                  onClick={() =>
                    watchMovie(series.id, {
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
                <span className="text-white">Director:</span> {series.director}
              </div>
              <div>
                <span className="text-white">Cast:</span>{" "}
                {series.cast?.join(", ")}
              </div>
              <div>
                <span className="text-white">Tags:</span>{" "}
                {series.tags?.join(", ")}
              </div>
            </div>
          </div>
          <div className="glass rounded-[32px] border-white/10 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              Similar Titles
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
