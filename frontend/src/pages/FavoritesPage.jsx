import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { useMovieStore } from "../store/useMovieStore";

export function FavoritesPage() {
  const favorites = useMovieStore((state) => state.favorites);
  const loadFavorites = useMovieStore((state) => state.loadFavorites);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">
            Favorites
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Your saved movies
          </h1>
        </div>
        <Link
          to="/"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
        >
          Back to catalog
        </Link>
      </div>
      {favorites.length === 0 ? (
        <div className="glass rounded-[28px] border-white/10 p-8 text-white/60">
          No favorites yet. Add a movie from the catalog or detail page.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} actions={null} />
          ))}
        </div>
      )}
    </div>
  );
}
