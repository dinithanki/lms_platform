import api from "./api";

const notificationService = {
  getNotifications: async () => {
    const response = await api.get("/api/notify/in-app");
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/api/notify/in-app/unread-count");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/api/notify/in-app/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/api/notify/in-app/read-all");
    return response.data;
  },

  createNotification: async (recipient, title, message, type = "UPDATE") => {
    const response = await api.post("/api/notify/in-app", {
      recipient,
      title,
      message,
      type,
    });
    return response.data;
  },
};

export default notificationService;
