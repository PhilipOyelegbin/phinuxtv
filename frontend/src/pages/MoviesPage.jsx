import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { useMovieStore } from "../store/useMovieStore";
import { useAuthStore } from "../store/useAuthStore";

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const pageFromQuery = Number(searchParams.get("page") || 1);
  const page = Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
  const movies = useMovieStore((state) => state.catalog);
  const loadCatalog = useMovieStore((state) => state.loadCatalog);
  const goToPage = useMovieStore((state) => state.goToPage);
  const totalPages = useMovieStore((state) => state.totalPages);
  const totalResults = useMovieStore((state) => state.totalResults);
  const isLoading = useMovieStore((state) => state.isLoading);
  const loadFavorites = useMovieStore((state) => state.loadFavorites);
  const loadHistory = useMovieStore((state) => state.loadHistory);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadCatalog(search, page);
  }, [loadCatalog, page, search]);

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadHistory();
    }
  }, [loadFavorites, loadHistory, user]);

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

  const updateQuery = (nextSearch, nextPage) => {
    const params = new URLSearchParams();

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    params.set("page", String(nextPage));
    setSearchParams(params, { replace: true });
  };

  const onSearch = (event) => {
    const value = event.target.value;
    updateQuery(value, 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="glass relative overflow-hidden rounded-[36px] border-white/10 p-6 sm:p-10">
        <div className="absolute inset-0 grid-fade opacity-20" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55">
              Movie catalog
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
              Browse all paginated movies in one place.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Search the library, move through pages, and jump straight into a
              movie detail page.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
            {totalResults} total titles
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={onSearch}
            placeholder="Search by title, genre, tag, or director"
            className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-mint-400/40"
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              Paginated movies
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Trending movies
            </h2>
          </div>
          <div className="text-sm text-white/45">
            Page {page} of {Math.max(totalPages, 1)}
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="glass rounded-[28px] border-white/10 p-8 text-white/60">
            No movies found for this page.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} actions={null} />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <button
            onClick={() => updateQuery(search, page - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
            {visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => updateQuery(search, 1)}
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
                  onClick={() => updateQuery(search, pageNumber)}
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
                  onClick={() => updateQuery(search, totalPages)}
                  disabled={isLoading}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => updateQuery(search, page + 1)}
            disabled={page >= totalPages || isLoading}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
