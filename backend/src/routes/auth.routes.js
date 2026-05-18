const express = require("express");
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} = require("../services/auth.service");
const { requireAuth } = require("../middleware/auth");

function createAuthRoutes(dataSource) {
  const router = express.Router();

  router.post("/register", async (req, res, next) => {
    try {
      const result = await register(dataSource, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const result = await login(dataSource, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuth, async (req, res, next) => {
    try {
      const user = await getCurrentUser(dataSource, req.auth.userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.post("/forgot-password", async (req, res, next) => {
    try {
      const result = await forgotPassword(dataSource, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/reset-password", async (req, res, next) => {
    try {
      const result = await resetPassword(dataSource, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { createAuthRoutes };
