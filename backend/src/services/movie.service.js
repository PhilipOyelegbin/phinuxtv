const { In } = require("typeorm");
const {
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
  fetchPopularTvShows,
  searchTvShows,
  searchMovies,
  fetchMovieDetails,
  fetchTvSeriesDetails,
  fetchTvSeriesRecommendations,
  fetchRecommendations,
  buildTvEmbedUrl,
  toMovieEntity,
  toMovieResponse,
} = require("./tmdb.service");
const { getCache, setCache } = require("../cache/redis");

function movieToResponse(movie, flags = {}) {
  return {
    ...toMovieResponse(movie),
    isFavorite: Boolean(flags.isFavorite),
    isLiked: Boolean(flags.isLiked),
  };
}

function createCacheKey(scope, value) {
  return `phinuxtv:${scope}:${value}`;
}

async function getUserFlags(dataSource, userId, movieIds = []) {
  if (!userId || movieIds.length === 0) {
    return {
      favoriteMovieIds: new Set(),
      likedMovieIds: new Set(),
    };
  }

  const favoriteRepository = dataSource.getRepository("Favorite");
  const likeRepository = dataSource.getRepository("Like");

  const [favorites, likes] = await Promise.all([
    favoriteRepository.find({
      where: {
        user: { id: userId },
        movie: { id: In(movieIds) },
      },
    }),
    likeRepository.find({
      where: {
        user: { id: userId },
        movie: { id: In(movieIds) },
      },
    }),
  ]);

  return {
    favoriteMovieIds: new Set(favorites.map((item) => item.movie.id)),
    likedMovieIds: new Set(likes.map((item) => item.movie.id)),
  };
}

async function upsertMovieFromTmdb(dataSource, tmdbMovie) {
  const movieRepository = dataSource.getRepository("Movie");
  const payload = toMovieEntity(tmdbMovie);
  const existing = await movieRepository.findOne({
    where: { tmdbId: payload.tmdbId },
  });

  if (existing) {
    Object.assign(existing, payload);
    return movieRepository.save(existing);
  }

  const movie = movieRepository.create(payload);
  return movieRepository.save(movie);
}

async function syncTmdbMovieList(dataSource, tmdbMovies) {
  return Promise.all(
    tmdbMovies.map((tmdbMovie) => upsertMovieFromTmdb(dataSource, tmdbMovie)),
  );
}

function toTvSeriesEntity(tmdbSeries) {
  const genres = Array.isArray(tmdbSeries.genres)
    ? tmdbSeries.genres.map((genre) => genre.name).filter(Boolean)
    : [];

  return {
    tmdbId: Number(tmdbSeries.id),
    title: tmdbSeries.name || tmdbSeries.original_name || "Untitled",
    description: tmdbSeries.overview || "No description available.",
    genre: genres[0] || "TV Series",
    tags: genres,
    cast: Array.isArray(tmdbSeries.credits?.cast)
      ? tmdbSeries.credits.cast
          .slice(0, 5)
          .map((member) => member.name)
          .filter(Boolean)
      : [],
    director: Array.isArray(tmdbSeries.credits?.crew)
      ? (
          tmdbSeries.credits.crew.find((member) => member.job === "Director") ||
          {}
        ).name || ""
      : "",
    releaseYear: tmdbSeries.first_air_date
      ? Number(tmdbSeries.first_air_date.slice(0, 4))
      : 0,
    durationMinutes:
      Array.isArray(tmdbSeries.episode_run_time) &&
      tmdbSeries.episode_run_time.length > 0
        ? tmdbSeries.episode_run_time[0]
        : 0,
    rating: tmdbSeries.vote_average || 0,
    posterUrl: tmdbSeries.poster_path
      ? `https://image.tmdb.org/t/p/w780${tmdbSeries.poster_path}`
      : "",
    streamUrl: buildTvEmbedUrl(tmdbSeries.id),
  };
}

async function upsertTvSeriesFromTmdb(dataSource, tmdbSeries) {
  const movieRepository = dataSource.getRepository("Movie");
  const payload = toTvSeriesEntity(tmdbSeries);
  const existing = await movieRepository.findOne({
    where: { tmdbId: payload.tmdbId },
  });

  if (existing) {
    Object.assign(existing, payload);
    return movieRepository.save(existing);
  }

  const series = movieRepository.create(payload);
  return movieRepository.save(series);
}

async function syncTmdbTvSeriesList(dataSource, tmdbSeriesList) {
  return Promise.all(
    tmdbSeriesList.map((tmdbSeries) =>
      upsertTvSeriesFromTmdb(dataSource, tmdbSeries),
    ),
  );
}

async function listTmdbCollection(dataSource, userId, cacheKey, fetcher, page) {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const cached = await getCache(cacheKey);

  if (cached) {
    const flags = await getUserFlags(
      dataSource,
      userId,
      cached.movies.map((movie) => movie.id),
    );

    return {
      movies: cached.movies.map((movie) =>
        movieToResponse(movie, {
          isFavorite: flags.favoriteMovieIds.has(movie.id),
          isLiked: flags.likedMovieIds.has(movie.id),
        }),
      ),
      page: cached.page,
      totalPages: cached.totalPages,
      totalResults: cached.totalResults,
    };
  }

  const tmdbPayload = await fetcher(currentPage);
  const movies = await syncTmdbMovieList(dataSource, tmdbPayload.results);
  const responsePayload = {
    movies,
    page: tmdbPayload.page,
    totalPages: tmdbPayload.totalPages,
    totalResults: tmdbPayload.totalResults,
  };
  await setCache(cacheKey, responsePayload, 300);

  const flags = await getUserFlags(
    dataSource,
    userId,
    movies.map((movie) => movie.id),
  );

  return {
    movies: movies.map((movie) =>
      movieToResponse(movie, {
        isFavorite: flags.favoriteMovieIds.has(movie.id),
        isLiked: flags.likedMovieIds.has(movie.id),
      }),
    ),
    page: responsePayload.page,
    totalPages: responsePayload.totalPages,
    totalResults: responsePayload.totalResults,
  };
}

async function resolveMovieRecord(dataSource, movieIdentifier) {
  const movieRepository = dataSource.getRepository("Movie");
  const identifier = String(movieIdentifier);

  const byId = await movieRepository.findOne({ where: { id: identifier } });
  if (byId) {
    return byId;
  }

  if (/^\d+$/.test(identifier)) {
    const byTmdbId = await movieRepository.findOne({
      where: { tmdbId: Number(identifier) },
    });

    if (byTmdbId) {
      return byTmdbId;
    }

    const tmdbMovie = await fetchMovieDetails(Number(identifier));
    return upsertMovieFromTmdb(dataSource, tmdbMovie);
  }

  const error = new Error("Movie not found");
  error.statusCode = 404;
  throw error;
}

async function cacheMovieRecord(movie) {
  const cacheScope = String(movie.streamUrl || "").includes("/embed/tv/")
    ? "tv-series"
    : "movie";

  await Promise.all([
    setCache(createCacheKey(`${cacheScope}:id`, movie.id), movie, 1800),
    setCache(createCacheKey(`${cacheScope}:tmdb`, movie.tmdbId), movie, 1800),
  ]);
}

async function getEnrichedMovie(dataSource, movieIdentifier) {
  const movie = await resolveMovieRecord(dataSource, movieIdentifier);
  const isTvSeries = String(movie.streamUrl || "").includes("/embed/tv/");

  if (
    !movie.cast ||
    movie.cast.length === 0 ||
    !movie.director ||
    !movie.durationMinutes ||
    !movie.streamUrl
  ) {
    const details = isTvSeries
      ? await fetchTvSeriesDetails(movie.tmdbId)
      : await fetchMovieDetails(movie.tmdbId);
    const refreshedMovie = isTvSeries
      ? await upsertTvSeriesFromTmdb(dataSource, details)
      : await upsertMovieFromTmdb(dataSource, details);
    await cacheMovieRecord(refreshedMovie);
    return refreshedMovie;
  }

  await cacheMovieRecord(movie);
  return movie;
}

async function listMovies(dataSource, userId, search, page = 1) {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const cacheKey = createCacheKey(
    "movies",
    search
      ? `search:${search}:page:${currentPage}`
      : `popular:page:${currentPage}`,
  );
  const cached = await getCache(cacheKey);

  if (cached) {
    const flags = await getUserFlags(
      dataSource,
      userId,
      cached.movies.map((movie) => movie.id),
    );

    return {
      movies: cached.movies.map((movie) =>
        movieToResponse(movie, {
          isFavorite: flags.favoriteMovieIds.has(movie.id),
          isLiked: flags.likedMovieIds.has(movie.id),
        }),
      ),
      page: cached.page,
      totalPages: cached.totalPages,
      totalResults: cached.totalResults,
    };
  }

  const tmdbPayload = search
    ? await searchMovies(search, currentPage)
    : await fetchPopularMovies(currentPage);
  const movies = await syncTmdbMovieList(dataSource, tmdbPayload.results);
  const responsePayload = {
    movies,
    page: tmdbPayload.page,
    totalPages: tmdbPayload.totalPages,
    totalResults: tmdbPayload.totalResults,
  };
  await setCache(cacheKey, responsePayload, 300);

  const flags = await getUserFlags(
    dataSource,
    userId,
    movies.map((movie) => movie.id),
  );

  return {
    movies: movies.map((movie) =>
      movieToResponse(movie, {
        isFavorite: flags.favoriteMovieIds.has(movie.id),
        isLiked: flags.likedMovieIds.has(movie.id),
      }),
    ),
    page: responsePayload.page,
    totalPages: responsePayload.totalPages,
    totalResults: responsePayload.totalResults,
  };
}

async function listMoviesByCategory(dataSource, userId, category, page = 1) {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const normalizedCategory = String(category || "").toLowerCase();

  switch (normalizedCategory) {
    case "now-playing":
      return listTmdbCollection(
        dataSource,
        userId,
        createCacheKey("movies", `now-playing:page:${currentPage}`),
        fetchNowPlayingMovies,
        currentPage,
      );
    case "upcoming":
      return listTmdbCollection(
        dataSource,
        userId,
        createCacheKey("movies", `upcoming:page:${currentPage}`),
        fetchUpcomingMovies,
        currentPage,
      );
    case "top-rated":
      return listTmdbCollection(
        dataSource,
        userId,
        createCacheKey("movies", `top-rated:page:${currentPage}`),
        fetchTopRatedMovies,
        currentPage,
      );
    case "popular":
      return listMovies(dataSource, userId, "", currentPage);
    default: {
      const error = new Error("Movie category not found");
      error.statusCode = 404;
      throw error;
    }
  }
}

async function listTvSeries(dataSource, userId, search, page = 1) {
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const cacheKey = createCacheKey(
    "tv-series-v2",
    search
      ? `search:${search}:page:${currentPage}`
      : `popular:page:${currentPage}`,
  );
  const cached = await getCache(cacheKey);

  if (cached) {
    return {
      tvSeries: cached.tvSeries,
      page: cached.page,
      totalPages: cached.totalPages,
      totalResults: cached.totalResults,
    };
  }

  const tmdbPayload = search
    ? await searchTvShows(search, currentPage)
    : await fetchPopularTvShows(currentPage);
  const tvSeries = await syncTmdbTvSeriesList(dataSource, tmdbPayload.results);

  const responsePayload = {
    tvSeries,
    page: tmdbPayload.page,
    totalPages: tmdbPayload.totalPages,
    totalResults: tmdbPayload.totalResults,
  };

  await setCache(cacheKey, responsePayload, 300);

  return responsePayload;
}

async function getTvSeriesById(dataSource, userId, seriesId) {
  const movieRepository = dataSource.getRepository("Movie");
  const identifier = String(seriesId);
  let series = await movieRepository.findOne({ where: { id: identifier } });

  if (!series && /^\d+$/.test(identifier)) {
    series = await movieRepository.findOne({
      where: { tmdbId: Number(identifier) },
    });
  }

  if (!series && /^\d+$/.test(identifier)) {
    const tmdbSeries = await fetchTvSeriesDetails(Number(identifier));
    series = await upsertTvSeriesFromTmdb(dataSource, tmdbSeries);
  }

  if (!series) {
    const error = new Error("TV series not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    !series.cast ||
    series.cast.length === 0 ||
    !series.director ||
    !series.durationMinutes ||
    !series.streamUrl ||
    !String(series.streamUrl).includes("/embed/tv/")
  ) {
    const tmdbSeries = await fetchTvSeriesDetails(series.tmdbId);
    series = await upsertTvSeriesFromTmdb(dataSource, tmdbSeries);
  }

  const flags = await getUserFlags(dataSource, userId, [series.id]);
  return movieToResponse(series, {
    isFavorite: flags.favoriteMovieIds.has(series.id),
    isLiked: flags.likedMovieIds.has(series.id),
  });
}

async function getMovieById(dataSource, userId, movieId) {
  const movie = await getEnrichedMovie(dataSource, movieId);
  const flags = await getUserFlags(dataSource, userId, [movie.id]);

  return movieToResponse(movie, {
    isFavorite: flags.favoriteMovieIds.has(movie.id),
    isLiked: flags.likedMovieIds.has(movie.id),
  });
}

async function addFavorite(dataSource, userId, movieId) {
  const movie = await resolveMovieRecord(dataSource, movieId);
  const favoriteRepository = dataSource.getRepository("Favorite");
  const existing = await favoriteRepository.findOne({
    where: { user: { id: userId }, movie: { id: movie.id } },
  });

  if (existing) {
    return { favorite: true };
  }

  const favorite = favoriteRepository.create({
    user: { id: userId },
    movie: { id: movie.id },
  });

  await favoriteRepository.save(favorite);
  return { favorite: true };
}

async function removeFavorite(dataSource, userId, movieId) {
  const movie = await resolveMovieRecord(dataSource, movieId);
  const favoriteRepository = dataSource.getRepository("Favorite");
  const existing = await favoriteRepository.findOne({
    where: { user: { id: userId }, movie: { id: movie.id } },
  });

  if (!existing) {
    return { favorite: false };
  }

  await favoriteRepository.remove(existing);
  return { favorite: false };
}

async function addLike(dataSource, userId, movieId) {
  const movie = await resolveMovieRecord(dataSource, movieId);
  const likeRepository = dataSource.getRepository("Like");
  const existing = await likeRepository.findOne({
    where: { user: { id: userId }, movie: { id: movie.id } },
  });

  if (existing) {
    return { liked: true };
  }

  const like = likeRepository.create({
    user: { id: userId },
    movie: { id: movie.id },
  });

  await likeRepository.save(like);
  return { liked: true };
}

async function removeLike(dataSource, userId, movieId) {
  const movie = await resolveMovieRecord(dataSource, movieId);
  const likeRepository = dataSource.getRepository("Like");
  const existing = await likeRepository.findOne({
    where: { user: { id: userId }, movie: { id: movie.id } },
  });

  if (!existing) {
    return { liked: false };
  }

  await likeRepository.remove(existing);
  return { liked: false };
}

async function watchMovie(
  dataSource,
  userId,
  movieId,
  progressSeconds = 0,
  completed = false,
) {
  const movie = await resolveMovieRecord(dataSource, movieId);
  const watchHistoryRepository = dataSource.getRepository("WatchHistory");
  const existing = await watchHistoryRepository.findOne({
    where: { user: { id: userId }, movie: { id: movie.id } },
  });

  if (existing) {
    existing.progressSeconds = Number(progressSeconds) || 0;
    existing.completed = Boolean(completed) || existing.completed;
    existing.watchedAt = new Date();
    return watchHistoryRepository.save(existing);
  }

  const historyEntry = watchHistoryRepository.create({
    user: { id: userId },
    movie: { id: movie.id },
    progressSeconds,
    completed,
    watchedAt: new Date(),
  });

  await watchHistoryRepository.save(historyEntry);
  return historyEntry;
}

async function getFavorites(dataSource, userId) {
  const favoriteRepository = dataSource.getRepository("Favorite");
  const favorites = await favoriteRepository.find({
    where: { user: { id: userId } },
    order: { createdAt: "DESC" },
  });

  return favorites.map((item) =>
    movieToResponse(item.movie, { isFavorite: true }),
  );
}

async function getHistory(dataSource, userId) {
  const watchHistoryRepository = dataSource.getRepository("WatchHistory");
  const history = await watchHistoryRepository.find({
    where: { user: { id: userId } },
    order: { watchedAt: "DESC" },
  });

  const uniqueHistory = [];
  const seenMovieIds = new Set();

  history.forEach((entry) => {
    const movieId = entry.movie.id;
    if (!seenMovieIds.has(movieId)) {
      seenMovieIds.add(movieId);
      uniqueHistory.push(entry);
    }
  });

  return uniqueHistory.map((entry) => ({
    id: entry.id,
    watchedAt: entry.watchedAt,
    progressSeconds: entry.progressSeconds,
    completed: entry.completed,
    movie: movieToResponse(entry.movie, {}),
  }));
}

async function getRecommendations(dataSource, userId, movieId) {
  const currentMovie = await getEnrichedMovie(dataSource, movieId);
  const isTvSeries = String(currentMovie.streamUrl || "").includes(
    "/embed/tv/",
  );
  const cacheKey = createCacheKey(
    isTvSeries ? "tv-recommendations" : "recommendations",
    currentMovie.tmdbId,
  );
  const cached = await getCache(cacheKey);

  if (cached) {
    const flags = await getUserFlags(
      dataSource,
      userId,
      cached.map((movie) => movie.id),
    );

    return cached.map((movie) =>
      movieToResponse(movie, {
        isFavorite: flags.favoriteMovieIds.has(movie.id),
        isLiked: flags.likedMovieIds.has(movie.id),
      }),
    );
  }

  const tmdbRecommendations = isTvSeries
    ? await fetchTvSeriesRecommendations(currentMovie.tmdbId)
    : await fetchRecommendations(currentMovie.tmdbId);
  const movies = isTvSeries
    ? await syncTmdbTvSeriesList(dataSource, tmdbRecommendations.slice(0, 6))
    : await syncTmdbMovieList(dataSource, tmdbRecommendations.slice(0, 6));
  await setCache(cacheKey, movies, 1800);

  const flags = await getUserFlags(
    dataSource,
    userId,
    movies.map((movie) => movie.id),
  );

  return movies.map((movie) =>
    movieToResponse(movie, {
      isFavorite: flags.favoriteMovieIds.has(movie.id),
      isLiked: flags.likedMovieIds.has(movie.id),
    }),
  );
}

module.exports = {
  movieToResponse,
  listMovies,
  listMoviesByCategory,
  listTvSeries,
  getTvSeriesById,
  getMovieById,
  addFavorite,
  removeFavorite,
  addLike,
  removeLike,
  watchMovie,
  getFavorites,
  getHistory,
  getRecommendations,
};
