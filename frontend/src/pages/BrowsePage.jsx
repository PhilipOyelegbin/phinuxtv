import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { MovieCarouselSection } from "../components/MovieCarouselSection";
import { useMovieStore } from "../store/useMovieStore";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../api/client";

export function BrowsePage() {
  const [search, setSearch] = useState("");
  const [collections, setCollections] = useState({
    nowPlaying: [],
    upcoming: [],
    popular: [],
    topRated: [],
  });
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const movies = useMovieStore((state) => state.catalog);
  const loadCatalog = useMovieStore((state) => state.loadCatalog);
  const goToPage = useMovieStore((state) => state.goToPage);
  const page = useMovieStore((state) => state.page);
  const totalPages = useMovieStore((state) => state.totalPages);
  const totalResults = useMovieStore((state) => state.totalResults);
  const isLoading = useMovieStore((state) => state.isLoading);
  const loadFavorites = useMovieStore((state) => state.loadFavorites);
  const loadHistory = useMovieStore((state) => state.loadHistory);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadCatalog("");
    if (user) {
      loadFavorites();
      loadHistory();
    }
  }, [loadCatalog, loadFavorites, loadHistory, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadCollections = async () => {
      setCollectionsLoading(true);

      try {
        const [nowPlaying, upcoming, popular, topRated] = await Promise.all([
          api.nowPlayingMovies(1),
          api.upcomingMovies(1),
          api.popularMovies(1),
          api.topRatedMovies(1),
        ]);

        if (!cancelled) {
          setCollections({
            nowPlaying: nowPlaying.movies,
            upcoming: upcoming.movies,
            popular: popular.movies,
            topRated: topRated.movies,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setCollections({
            nowPlaying: [],
            upcoming: [],
            popular: [],
            topRated: [],
          });
        }
      } finally {
        if (!cancelled) {
          setCollectionsLoading(false);
        }
      }
    };

    loadCollections();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const featured = useMemo(() => movies[0], [movies]);

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    const safeTotalPages = Math.max(totalPages, 1);
    if (safeTotalPages <= maxVisible) {
      return Array.from(
        { length: safeTotalPages },
        (_item, index) => index + 1,
      );
    }

    const halfWindow = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - halfWindow);
    let end = start + maxVisible - 1;

    if (end > safeTotalPages) {
      end = safeTotalPages;
      start = end - maxVisible + 1;
    }

    return Array.from(
      { length: end - start + 1 },
      (_item, index) => start + index,
    );
  }, [page, totalPages]);

  const onSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    loadCatalog(value, 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="glass relative overflow-hidden rounded-[36px] border-white/10 p-6 sm:p-10">
        <div className="absolute inset-0 grid-fade opacity-20" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55">
              Personal cinema
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
              Search, save, like, and keep watching with PhinuxTV.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/65 sm:text-lg">
              Explore the catalog, jump straight into the player, and surface
              recommendations that respond to your watch history and saved
              movies.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={onSearch}
                placeholder="Search by title, genre, tag, or director"
                className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-mint-400/40"
              />
              {featured && (
                <Link
                  to={`/movie/${featured.id}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-ink-950 transition hover:bg-white/90"
                >
                  Watch featured
                </Link>
              )}
              <Link
                to="/movies"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View all movies
              </Link>
            </div>
          </div>
          {featured && (
            <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-glow">
              <img
                src={featured.posterUrl}
                alt={featured.title}
                className="h-80 w-full object-cover"
              />
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/45">
                  <span>Featured pick</span>
                  <span>{featured.genre}</span>
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  {featured.title}
                </h2>
                <p className="text-sm leading-6 text-white/65">
                  {featured.description}
                </p>
              </div>
            </article>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Search", "Find titles instantly using server-side search."],
          ["Favorites", "Keep a private watchlist across sessions."],
          ["Recommendations", "Discover similar films based on taste signals."],
        ].map(([title, text]) => (
          <div key={title} className="glass rounded-[28px] border-white/10 p-5">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
          </div>
        ))}
      </section>

      {search.trim().length === 0 ? (
        <div className="mt-12 space-y-12">
          {collectionsLoading && (
            <div className="glass rounded-[28px] border-white/10 p-8 text-white/60">
              Loading movie sections...
            </div>
          )}
          <MovieCarouselSection
            title="Now Playing"
            movies={collections.nowPlaying}
          />
          <MovieCarouselSection
            title="Upcoming"
            movies={collections.upcoming}
          />
          <MovieCarouselSection title="Popular" movies={collections.popular} />
          <MovieCarouselSection
            title="Top Rated"
            movies={collections.topRated}
          />
        </div>
      ) : (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/45">
                Catalog
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Trending movies
              </h2>
            </div>
            <div className="text-sm text-white/45">
              {totalResults} total titles
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} actions={null} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isLoading}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-2 text-sm text-white/60">
              {visiblePages[0] > 1 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    disabled={isLoading}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    1
                  </button>
                  {visiblePages[0] > 2 && (
                    <span className="text-white/40">...</span>
                  )}
                </>
              )}

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  disabled={isLoading}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    pageNumber === page
                      ? "border-mint-400/60 bg-mint-400/20 text-mint-200"
                      : "border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <span className="text-white/40">...</span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={isLoading}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
