const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const { createAuthRoutes } = require("./routes/auth.routes");
const { createMovieRoutes } = require("./routes/movie.routes");
const { createMeRoutes } = require("./routes/me.routes");
const { createSwaggerSpec } = require("./swagger");

function createApp(dataSource) {
  const app = express();
  const swaggerSpec = createSwaggerSpec();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "PhinuxTV API" });
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use("/api/auth", createAuthRoutes(dataSource));
  app.use("/api/movies", createMovieRoutes(dataSource));
  app.use("/api/me", createMeRoutes(dataSource));

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: error.message || "Unexpected error",
    });
  });

  return app;
}

module.exports = { createApp };
