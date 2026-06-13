import api from "./api";

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
    return `http://localhost:8080/api/users/${id}/profile-picture`;
  },
};

export default userService;
