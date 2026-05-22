const express = require("express");
const {
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
  getRecommendations,
} = require("../services/movie.service");
const { requireAuth } = require("../middleware/auth");

function createMovieRoutes(dataSource) {
  const router = express.Router();

  router.get("/", requireAuth, async (req, res, next) => {
    try {
      const result = await listMovies(
        dataSource,
        req.auth.userId,
        req.query.search || "",
        Number(req.query.page || 1),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/now-playing", requireAuth, async (req, res, next) => {
    try {
      const result = await listMoviesByCategory(
        dataSource,
        req.auth.userId,
        "now-playing",
        Number(req.query.page || 1),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/upcoming", requireAuth, async (req, res, next) => {
    try {
      const result = await listMoviesByCategory(
        dataSource,
        req.auth.userId,
        "upcoming",
        Number(req.query.page || 1),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/top-rated", requireAuth, async (req, res, next) => {
    try {
      const result = await listMoviesByCategory(
        dataSource,
        req.auth.userId,
        "top-rated",
        Number(req.query.page || 1),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/popular", requireAuth, async (req, res, next) => {
    try {
      const result = await listMoviesByCategory(
        dataSource,
        req.auth.userId,
        "popular",
        Number(req.query.page || 1),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/tv-series", requireAuth, async (req, res, next) => {
    try {
      const result = await listTvSeries(
        dataSource,
        req.auth.userId,
        req.query.search || "",
        Number(req.query.page || 1),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/tv-series/:seriesId", requireAuth, async (req, res, next) => {
    try {
      const movie = await getTvSeriesById(
        dataSource,
        req.auth.userId,
        req.params.seriesId,
      );
      res.json({ movie });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:movieId", requireAuth, async (req, res, next) => {
    try {
      const movie = await getMovieById(
        dataSource,
        req.auth.userId,
        req.params.movieId,
      );
      res.json({ movie });
    } catch (error) {
      next(error);
    }
  });

  router.get(
    "/:movieId/recommendations",
    requireAuth,
    async (req, res, next) => {
      try {
        const movies = await getRecommendations(
          dataSource,
          req.auth.userId,
          req.params.movieId,
        );
        res.json({ movies });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post("/:movieId/watch", requireAuth, async (req, res, next) => {
    try {
      const historyEntry = await watchMovie(
        dataSource,
        req.auth.userId,
        req.params.movieId,
        Number(req.body.progressSeconds || 0),
        Boolean(req.body.completed),
      );
      res.status(201).json({ historyEntry });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:movieId/favorite", requireAuth, async (req, res, next) => {
    try {
      const result = await addFavorite(
        dataSource,
        req.auth.userId,
        req.params.movieId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:movieId/favorite", requireAuth, async (req, res, next) => {
    try {
      const result = await removeFavorite(
        dataSource,
        req.auth.userId,
        req.params.movieId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/:movieId/like", requireAuth, async (req, res, next) => {
    try {
      const result = await addLike(
        dataSource,
        req.auth.userId,
        req.params.movieId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:movieId/like", requireAuth, async (req, res, next) => {
    try {
      const result = await removeLike(
        dataSource,
        req.auth.userId,
        req.params.movieId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createMovieRoutes };
