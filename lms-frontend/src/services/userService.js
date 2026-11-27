import api from "./api";
import { API_BASE_URL } from "./apiBaseUrl";

const userService = {
  getProfile: async () => {
    const response = await api.get("/api/users/me");
    return response.data; // UserProfileResponseDTO
  },

  getProfileById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  updateProfile: async (id, name, phone, bio) => {
    const response = await api.put(`/api/users/${id}`, {
      name,
      phone,
      bio,
    });
    return response.data; // UserProfileResponseDTO
  },

  uploadProfilePicture: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/api/users/${id}/profile-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // UserProfileResponseDTO
  },

  getProfilePictureUrl: (id) => {
    return `${API_BASE_URL}/api/users/${id}/profile-picture`;
  },
};

export default userService;
