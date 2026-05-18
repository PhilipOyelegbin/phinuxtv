import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const isReady = useAuthStore((state) => state.isReady);

  if (!isReady) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
