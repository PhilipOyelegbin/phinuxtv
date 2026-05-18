const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("phinuxtv-token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (payload) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resetPassword: (payload) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request("/auth/me"),
  movies: (search = "", page = 1) => {
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    params.set("page", String(page));
    const query = params.toString();

    return request(`/movies${query ? `?${query}` : ""}`);
  },
  movie: (id) => request(`/movies/${id}`),
  recommendations: (id) => request(`/movies/${id}/recommendations`),
  watch: (id, payload = {}) =>
    request(`/movies/${id}/watch`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  toggleFavorite: (id, active) =>
    request(`/movies/${id}/favorite`, { method: active ? "DELETE" : "POST" }),
  toggleLike: (id, active) =>
    request(`/movies/${id}/like`, { method: active ? "DELETE" : "POST" }),
  favorites: () => request("/me/favorites"),
  history: () => request("/me/history"),
};
