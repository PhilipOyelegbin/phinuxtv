const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getFavorites, getHistory } = require("../services/movie.service");

function createMeRoutes(dataSource) {
  const router = express.Router();

  router.get("/favorites", requireAuth, async (req, res, next) => {
    try {
      const movies = await getFavorites(dataSource, req.auth.userId);
      res.json({ movies });
    } catch (error) {
      next(error);
    }
  });

  router.get("/history", requireAuth, async (req, res, next) => {
    try {
      const history = await getHistory(dataSource, req.auth.userId);
      res.json({ history });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createMeRoutes };
