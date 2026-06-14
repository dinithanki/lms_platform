import api from "./api";

const normalizeRole = (role) => {
  if (!role) {
    return "";
  }

  return role.toUpperCase() === "TEACHER" ? "INSTRUCTOR" : role;
};

const getUserHeaders = () => {
  try {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      return {};
    }

    const user = JSON.parse(cachedUser);
    return {
      "X-User-Name": user?.email || user?.name || "",
      "X-User-Role": normalizeRole(user?.role),
    };
  } catch {
    return {};
  }
};

const withUserHeaders = (config = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    ...getUserHeaders(),
  },
});

const courseService = {
  getAllCourses: async () => {
    const response = await api.get("/api/courses", withUserHeaders());
    return response.data; // List of CourseResponseDTO
  },

  getCourseById: async (id) => {
    const response = await api.get(`/api/courses/${id}`, withUserHeaders());
    return response.data; // CourseResponseDTO (which contains list of modules too)
  },

  createCourse: async (title, description) => {
    const response = await api.post("/api/courses", { title, description }, withUserHeaders());
    return response.data;
  },

  updateCourse: async (id, title, description) => {
    const response = await api.put(`/api/courses/${id}`, { title, description }, withUserHeaders());
    return response.data;
  },

  getModules: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/modules`, withUserHeaders());
    return response.data; // List of ModuleResponseDTO
  },

  createModule: async (courseId, { title, videoUrl, resourceUrl }) => {
    const response = await api.post(
      `/api/courses/${courseId}/modules`,
      {
        title,
        videoUrl,
        resourceUrl,
      },
      withUserHeaders()
    );
    return response.data;
  },

  completeModule: async (moduleId, studentId) => {
    const response = await api.post(`/api/modules/${moduleId}/complete`, null, {
      params: { studentId },
    });
    return response.data;
  },

  getCourseProgress: async (courseId, studentId) => {
    const response = await api.get(
      `/api/courses/${courseId}/progress`,
      withUserHeaders({ params: { studentId } })
    );
    return response.data; // ProgressResponseDTO { progressPercent, completedModulesCount, totalModulesCount }
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/api/courses/${id}`, withUserHeaders());
    return response.data;
  },
};

export default courseService;
