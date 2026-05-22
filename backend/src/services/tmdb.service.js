const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
const VIDSRC_EMBED_BASE_URL = "https://vidsrc-embed.ru/embed/movie";

function buildEmbedUrl(tmdbId) {
  return `${VIDSRC_EMBED_BASE_URL}/${tmdbId}`;
}

function getTmdbKey() {
  if (!process.env.TMDB_API_KEY) {
    const error = new Error("TMDB_API_KEY is required");
    error.statusCode = 500;
    throw error;
  }

  return process.env.TMDB_API_KEY;
}

async function tmdbRequest(path, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getTmdbKey());

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(
      `TMDB request failed with status ${response.status}`,
    );
    error.statusCode = response.status;
    error.details = body;
    throw error;
  }

  return response.json();
}

function posterUrl(path) {
  return path ? `${IMAGE_BASE_URL}${path}` : "";
}

function extractDirector(credits = {}) {
  const crew = Array.isArray(credits.crew) ? credits.crew : [];
  const director = crew.find((member) => member.job === "Director");
  return director ? director.name : "";
}

function extractCast(credits = {}) {
  return Array.isArray(credits.cast)
    ? credits.cast
        .slice(0, 5)
        .map((member) => member.name)
        .filter(Boolean)
    : [];
}

function normalizeGenres(movie) {
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.map((genre) => genre.name).filter(Boolean);
  }

  return [];
}

function toMovieEntity(tmdbMovie) {
  const genres = normalizeGenres(tmdbMovie);
  const tmdbId = Number(tmdbMovie.id);

  return {
    tmdbId,
    title: tmdbMovie.title || tmdbMovie.name || "Untitled",
    description: tmdbMovie.overview || "No description available.",
    genre: genres[0] || "Unknown",
    tags: genres,
    cast: extractCast(tmdbMovie.credits),
    director: extractDirector(tmdbMovie.credits),
    releaseYear: tmdbMovie.release_date
      ? Number(tmdbMovie.release_date.slice(0, 4))
      : 0,
    durationMinutes: tmdbMovie.runtime || 0,
    rating: tmdbMovie.vote_average || 0,
    posterUrl: posterUrl(tmdbMovie.poster_path),
    streamUrl: buildEmbedUrl(tmdbId),
  };
}

function toMovieResponse(movie) {
  return {
    id: movie.id,
    tmdbId: movie.tmdbId,
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    tags: Array.isArray(movie.tags) ? movie.tags : [],
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    director: movie.director,
    releaseYear: movie.releaseYear,
    durationMinutes: movie.durationMinutes,
    rating: Number(movie.rating),
    posterUrl: movie.posterUrl,
    streamUrl: movie.streamUrl,
    createdAt: movie.createdAt,
    updatedAt: movie.updatedAt,
  };
}

async function fetchPopularMovies(page = 1) {
  const payload = await tmdbRequest("/movie/popular", { page: String(page) });
  return {
    results: Array.isArray(payload.results) ? payload.results : [],
    page: Number(payload.page) || Number(page) || 1,
    totalPages: Number(payload.total_pages) || 1,
    totalResults: Number(payload.total_results) || 0,
  };
}

async function fetchNowPlayingMovies(page = 1) {
  const payload = await tmdbRequest("/movie/now_playing", {
    page: String(page),
  });
  return {
    results: Array.isArray(payload.results) ? payload.results : [],
    page: Number(payload.page) || Number(page) || 1,
    totalPages: Number(payload.total_pages) || 1,
    totalResults: Number(payload.total_results) || 0,
  };
}

async function fetchUpcomingMovies(page = 1) {
  const payload = await tmdbRequest("/movie/upcoming", { page: String(page) });
  return {
    results: Array.isArray(payload.results) ? payload.results : [],
    page: Number(payload.page) || Number(page) || 1,
    totalPages: Number(payload.total_pages) || 1,
    totalResults: Number(payload.total_results) || 0,
  };
}

async function fetchTopRatedMovies(page = 1) {
  const payload = await tmdbRequest("/movie/top_rated", {
    page: String(page),
  });
  return {
    results: Array.isArray(payload.results) ? payload.results : [],
    page: Number(payload.page) || Number(page) || 1,
    totalPages: Number(payload.total_pages) || 1,
    totalResults: Number(payload.total_results) || 0,
  };
}

async function searchMovies(query, page = 1) {
  const payload = await tmdbRequest("/search/movie", {
    query,
    page: String(page),
  });
  return {
    results: Array.isArray(payload.results) ? payload.results : [],
    page: Number(payload.page) || Number(page) || 1,
    totalPages: Number(payload.total_pages) || 1,
    totalResults: Number(payload.total_results) || 0,
  };
}

async function fetchMovieDetails(tmdbId) {
  const [movie, credits] = await Promise.all([
    tmdbRequest(`/movie/${tmdbId}`),
    tmdbRequest(`/movie/${tmdbId}/credits`),
  ]);

  return {
    ...movie,
    credits,
  };
}

async function fetchRecommendations(tmdbId) {
  const payload = await tmdbRequest(`/movie/${tmdbId}/recommendations`);
  return Array.isArray(payload.results) ? payload.results : [];
}

module.exports = {
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
  searchMovies,
  fetchMovieDetails,
  fetchRecommendations,
  toMovieEntity,
  toMovieResponse,
};
