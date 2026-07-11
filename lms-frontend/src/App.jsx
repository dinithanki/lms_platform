import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/authStore";

function AuthBootstrap({ children }) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const handleUnauthorized = useAuthStore((s) => s.handleUnauthorized);

  useEffect(() => {
    initializeAuth();

    // Listen to global unauthorized events from the axios interceptor
    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, [initializeAuth, handleUnauthorized]);

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </BrowserRouter>
  );
}

export default App;