import api from "./api";

const enrollmentService = {
  enrollStudent: async (courseId, studentId) => {
    const response = await api.post(`/api/courses/${courseId}/enroll`, {
      studentId,
    });
    return response.data;
  },

  getEnrolledCourses: async (studentId) => {
    const response = await api.get(`/api/students/${studentId}/courses`);
    return response.data; // List of CourseResponseDTO
  },
};

export default enrollmentService;
