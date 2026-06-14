import api from "./api";

const courseService = {
  getAllCourses: async () => {
    const response = await api.get("/api/courses");
    return response.data; // List of CourseResponseDTO
  },

  getCourseById: async (id) => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data; // CourseResponseDTO (which contains list of modules too)
  },

  createCourse: async (title, description) => {
    const response = await api.post("/api/courses", { title, description });
    return response.data;
  },

  getModules: async (courseId) => {
    const response = await api.get(`/api/courses/${courseId}/modules`);
    return response.data; // List of ModuleResponseDTO
  },

  createModule: async (courseId, { title, videoUrl, resourceUrl }) => {
    const response = await api.post(`/api/courses/${courseId}/modules`, {
      title,
      videoUrl,
      resourceUrl,
    });
    return response.data;
  },

  completeModule: async (moduleId, studentId) => {
    const response = await api.post(`/api/modules/${moduleId}/complete`, null, {
      params: { studentId },
    });
    return response.data;
  },

  getCourseProgress: async (courseId, studentId) => {
    const response = await api.get(`/api/courses/${courseId}/progress`, {
      params: { studentId },
    });
    return response.data; // ProgressResponseDTO { progressPercent, completedModulesCount, totalModulesCount }
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },
};

export default courseService;
