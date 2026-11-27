import axios from "axios";
import { API_BASE_URL } from "./apiBaseUrl";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token to protected API requests.
api.interceptors.request.use(
  (config) => {
    const requestUrl = new URL(
      config.url ?? "",
      config.baseURL || "http://localhost"
    );
    const isPublicAuthRequest =
      config.method?.toUpperCase() === "POST" &&
      ["/api/auth/register", "/api/auth/login"].includes(requestUrl.pathname);

    if (!isPublicAuthRequest) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
  }
);

export default api;
