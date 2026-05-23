function createSwaggerSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "PhinuxTV API",
      version: "1.0.0",
      description:
        "Movie streaming API for authentication, browsing, favorites, likes, history, and recommendations.",
    },
    servers: [
      {
        url: "http://localhost:4001/api",
        description: "Local",
      },
      {
        url: "https://api-phinuxtv.vercel.app/api",
        description: "Production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AuthRequest: {
          type: "object",
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          summary: "Create a new user",
          requestBody: { required: true },
          responses: { 201: { description: "User created" } },
        },
      },
      "/auth/login": {
        post: {
          summary: "Authenticate a user",
          requestBody: { required: true },
          responses: { 200: { description: "Authenticated" } },
        },
      },
      "/movies": {
        get: {
          summary: "List movies",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Movie catalog" } },
        },
      },
      "/movies/{movieId}": {
        get: {
          summary: "Get a movie",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Movie detail" } },
        },
      },
      "/movies/{movieId}/recommendations": {
        get: {
          summary: "Get similar movies",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Recommendations" } },
        },
      },
      "/movies/{movieId}/watch": {
        post: {
          summary: "Log a watch event",
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Watch history stored" } },
        },
      },
      "/movies/{movieId}/favorite": {
        post: {
          summary: "Toggle favorite on",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Favorite toggled" } },
        },
        delete: {
          summary: "Toggle favorite off",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Favorite toggled" } },
        },
      },
      "/movies/{movieId}/like": {
        post: {
          summary: "Toggle like on",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Like toggled" } },
        },
        delete: {
          summary: "Toggle like off",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Like toggled" } },
        },
      },
      "/me/favorites": {
        get: {
          summary: "Get favorite movies",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Favorites list" } },
        },
      },
      "/me/history": {
        get: {
          summary: "Get watch history",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Watch history list" } },
        },
      },
    },
  };
}

module.exports = { createSwaggerSpec };
