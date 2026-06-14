import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

const normalizeRole = (profile) => {
  if (!profile?.role) {
    return profile;
  }

  const normalizedRole =
    profile.role.toUpperCase() === "TEACHER" ? "INSTRUCTOR" : profile.role;
  return { ...profile, role: normalizedRole };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem("user");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Auto-validate token and load user profile on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = normalizeRole(await authService.getMe());
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } catch (error) {
          console.error("Token validation failed, logging out...", error);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to global unauthorized events from axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        localStorage.setItem("token", data.token);
        const profile = normalizeRole(await authService.getMe());
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return profile;
      } else {
        throw new Error("No token returned from authentication service.");
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, role);
      if (data.token) {
        localStorage.setItem("token", data.token);
        const profile = normalizeRole(await authService.getMe());
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return { success: true, profile };
      }
      return {
        success: false,
        requiresVerification: true,
        message: data.message,
      };
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const data = await authService.verifyOtp(email, otp);
      if (data.token) {
        localStorage.setItem("token", data.token);
        const profile = normalizeRole(await authService.getMe());
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return profile;
      } else {
        throw new Error(data.message || "Verification failed.");
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    await authService.logout();
  };

  const updateUserProfileLocal = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login: handleLogin,
    register: handleRegister,
    verifyOtp: handleVerifyOtp,
    logout: handleLogout,
    updateUserProfileLocal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
