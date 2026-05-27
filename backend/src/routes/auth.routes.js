const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  getCurrentUser,
  getUserCount,
  forgotPassword,
  resetPassword,
} = require("../services/auth.service");
const { requireAuth } = require("../middleware/auth");

const authMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many auth attempts. Please try again later.",
});

const userCountLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
});

function createAuthRoutes(dataSource) {
  const router = express.Router();

  router.post("/register", authMutationLimiter, async (req, res, next) => {
    try {
      const result = await register(dataSource, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", authMutationLimiter, async (req, res, next) => {
    try {
      const result = await login(dataSource, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/users/count", userCountLimiter, async (req, res, next) => {
    try {
      const result = await getUserCount(dataSource);
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

  router.post(
    "/forgot-password",
    authMutationLimiter,
    async (req, res, next) => {
      try {
        const result = await forgotPassword(dataSource, req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    "/reset-password",
    authMutationLimiter,
    async (req, res, next) => {
      try {
        const result = await resetPassword(dataSource, req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}

module.exports = { createAuthRoutes };
