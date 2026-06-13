import api from "./api";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data; // Expecting { message, token }
  },

  register: async (name, email, password, role) => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
      role,
    });
    return response.data; // Expecting { message, token }
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/api/auth/verify-otp", { email, otp });
    return response.data; // Expecting { message, token }
  },

  forgotPassword: async (email) => {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data; // Expecting { message }
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post("/api/auth/reset-password", { token, newPassword });
    return response.data; // Expecting { message }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout request failed on backend", error);
    }
    // Always clear tokens locally regardless of backend response
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data; // Expecting { id, name, email, role }
  },

  getAllUsers: async () => {
    const response = await api.get("/api/auth/users");
    return response.data; // Expecting List of UserResponseDTO
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/auth/users/${userId}/role`, { role });
    return response.data; // Expecting updated UserResponseDTO
  },
};

export default authService;
