import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";

function TVSeriesCard({ series }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-mint-300/30">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={series.posterUrl}
          alt={series.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80">
          TV Series
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{series.title}</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
              {series.releaseYear || "TBA"}
            </span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">
            {series.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/55">
          <span className="rounded-full bg-white/8 px-3 py-1">
            Rating {Number(series.rating || 0).toFixed(1)}
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1">
            TMDB #{series.tmdbId}
          </span>
        </div>
        <Link
          to={`/tv-series/${series.id}`}
          className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Watch
        </Link>
      </div>
    </article>
  );
}

export function TVSeriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const pageFromQuery = Number(searchParams.get("page") || 1);
  const page =
    Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;
  const [searchInput, setSearchInput] = useState(search);
  const [series, setSeries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    let isActive = true;

    async function loadSeries() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await api.tvSeries(search, page);
        if (!isActive) {
          return;
        }

        setSeries(payload.tvSeries || []);
        setTotalPages(payload.totalPages || 1);
        setTotalResults(payload.totalResults || 0);
      } catch (fetchError) {
        if (!isActive) {
          return;
        }

        setError(fetchError.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSeries();

    return () => {
      isActive = false;
    };
  }, [page, search]);

  const updateQuery = (nextSearch, nextPage) => {
    const params = new URLSearchParams();

    if (nextSearch) {
      params.set("search", nextSearch);
    }

    params.set("page", String(nextPage));
    setSearchParams(params, { replace: true });
  };

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
    setSearchInput(value);
    updateQuery(value, 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="glass relative overflow-hidden rounded-[36px] border-white/10 p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-20" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55">
              TV series catalog
            </div>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">
              Browse paginated TV series with search.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Search popular shows and move through pages without leaving the
              catalog.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
            {totalResults} total series
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={searchInput}
            onChange={onSearch}
            placeholder="Search TV series by title or keyword"
            className="w-full rounded-2xl border border-white/10 bg-ink-800/90 px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-mint-400/40"
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">
              Paginated TV series
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Trending TV shows
            </h2>
          </div>
          <div className="text-sm text-white/45">
            Page {page} of {Math.max(totalPages, 1)}
          </div>
        </div>

        {error ? (
          <div className="glass rounded-[28px] border-white/10 p-8 text-white/60">
            {error}
          </div>
        ) : series.length === 0 && !isLoading ? (
          <div className="glass rounded-[28px] border-white/10 p-8 text-white/60">
            No TV series found for this page.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {series.map((item) => (
              <TVSeriesCard key={item.tmdbId} series={item} />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <button
            onClick={() => updateQuery(search, Math.max(1, page - 1))}
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
