import { Route, Routes, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BrowsePage } from "./pages/BrowsePage";
import { MoviesPage } from "./pages/MoviesPage";
import { TVSeriesPage } from "./pages/TVSeriesPage";
import { TVSeriesDetailPage } from "./pages/TVSeriesDetailPage";
import { MoviePage } from "./pages/MoviePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AuthPage } from "./pages/AuthPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
      <Route path="/reset-password" element={<AuthPage mode="reset" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<BrowsePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="tv-series" element={<TVSeriesPage />} />
        <Route path="tv-series/:id" element={<TVSeriesDetailPage />} />
        <Route path="movie/:id" element={<MoviePage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
