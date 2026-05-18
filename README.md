# PhinuxTV

PhinuxTV is a responsive full-stack movie streaming app built with JavaScript, Express, TypeORM, Postgres, Redis, Vite, React, Tailwind CSS, Zustand, React Hook Form, and Yup.

## Features

- User registration and authentication with JWT + Argon2
- TMDB-powered movie catalog with Redis caching
- Search, pagination, and movie detail pages
- Movie playback using embedded streaming URLs
- Favorite and like actions
- Watch history tracking with unique entries per user and movie
- Similar movie recommendations
- Forgot password and reset password flow via email
- Swagger UI API documentation

## Setup

1. Copy the environment examples in `backend/.env.example` and `frontend/.env.example`.
2. Fill in the required backend values in `backend/.env`.
3. Start Postgres and Redis with `docker compose up -d`.
4. Install dependencies with `pnpm install`.
5. Run both apps with `pnpm run dev`.

## Environment Variables

Backend variables in `backend/.env`:

- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Backend port
- `CLIENT_ORIGIN` - Frontend origin allowed by CORS
- `TYPEORM_SYNC` - TypeORM schema sync flag
- `TMDB_API_KEY` - TMDB API key
- `REDIS_URL` - Redis connection string
- `RESET_PASSWORD_TOKEN_TTL_MINUTES` - Password reset token lifetime
- `SMTP_USER` - Sender email address used by Postmark
- `POSTMARK_API_KEY` - Postmark server token for reset emails

Frontend variables in `frontend/.env`:

- `VITE_API_URL` - Backend API base URL

## URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4001/api`
- Swagger UI: `http://localhost:4001/api-docs`

## Notes

- `TYPEORM_SYNC=true` is convenient for local development, but production should use migrations and set it to `false`.
- Reset password emails are sent through Postmark using the configured sender address.
- The catalog uses TMDB as the source of truth and caches responses in Redis.
- Movie history is deduplicated per user and movie in the API.
