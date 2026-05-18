import { create } from "zustand";
import { api } from "../api/client";

export const useMovieStore = create((set, get) => ({
  catalog: [],
  favorites: [],
  history: [],
  movie: null,
  recommendations: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  page: 1,
  totalPages: 1,
  totalResults: 0,
  loadCatalog: async (search = "", page = 1) => {
    const nextPage = Number(page) > 0 ? Number(page) : 1;
    set({
      isLoading: true,
      error: null,
      searchTerm: search,
      page: nextPage,
    });

    try {
      const {
        movies,
        page: currentPage = nextPage,
        totalPages = 1,
        totalResults = 0,
      } = await api.movies(search, nextPage);
      set({
        catalog: movies,
        isLoading: false,
        page: currentPage,
        totalPages,
        totalResults,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  goToPage: async (page) => {
    const { searchTerm, loadCatalog } = get();
    return loadCatalog(searchTerm, page);
  },
  loadFavorites: async () => {
    try {
      const { movies } = await api.favorites();
      set({ favorites: movies });
    } catch (error) {
      set({ error: error.message });
    }
  },
  loadHistory: async () => {
    try {
      const { history } = await api.history();
      set({ history });
    } catch (error) {
      set({ error: error.message });
    }
  },
  loadMovie: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const [{ movie }, { movies }] = await Promise.all([
        api.movie(id),
        api.recommendations(id),
      ]);

      set({ movie, recommendations: movies, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  watchMovie: async (id, payload = {}) => {
    await api.watch(id, payload);
    await get().loadHistory();
  },
  toggleFavorite: async (movie) => {
    await api.toggleFavorite(movie.id, movie.isFavorite);
    set((state) => {
      const nextMovie =
        state.movie && state.movie.id === movie.id
          ? { ...state.movie, isFavorite: !state.movie.isFavorite }
          : state.movie;

      const nextCatalog = state.catalog.map((item) =>
        item.id === movie.id ? { ...item, isFavorite: !item.isFavorite } : item,
      );
      const nextFavorites = movie.isFavorite
        ? state.favorites.filter((item) => item.id !== movie.id)
        : [
            movie,
            ...state.favorites.map((item) =>
              item.id === movie.id ? { ...item, isFavorite: true } : item,
            ),
          ];

      return {
        movie: nextMovie,
        catalog: nextCatalog,
        favorites: nextFavorites,
      };
    });
    await get().loadFavorites();
  },
  toggleLike: async (movie) => {
    await api.toggleLike(movie.id, movie.isLiked);
    set((state) => ({
      movie:
        state.movie && state.movie.id === movie.id
          ? { ...state.movie, isLiked: !state.movie.isLiked }
          : state.movie,
      catalog: state.catalog.map((item) =>
        item.id === movie.id ? { ...item, isLiked: !item.isLiked } : item,
      ),
    }));
  },
}));
