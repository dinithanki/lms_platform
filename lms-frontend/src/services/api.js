import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach simple user identity headers for downstream microservices
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user?.name) config.headers["X-User-Name"] = user.name;
        if (user?.role) config.headers["X-User-Role"] = user.role;
      } catch (e) {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), and not a login request, we can clear token and redirect
    if (error.response && error.response.status === 401) {
      const isAuthBypass =
        error.config.url.includes("/api/auth/login") ||
        error.config.url.includes("/api/auth/logout");
      if (!isAuthBypass) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // We can dispatch a custom event or let the AuthContext hook handle redirect
        window.dispatchEvent(new Event("auth-unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
