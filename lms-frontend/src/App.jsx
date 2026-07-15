import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/authStore";
import CustomDialog from "./components/CustomDialog";
import { useDialogStore } from "./store/dialogStore";

// Override native window.alert globally to use custom alert box
window.alert = (message) => {
  useDialogStore.getState().showAlert(message);
};

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
        <CustomDialog />
      </AuthBootstrap>
    </BrowserRouter>
  );
}

export default App;