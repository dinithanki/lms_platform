import api from "./api";

const quizService = {
  getQuizByCourseId: async (courseId, studentId) => {
    const response = await api.get(`/api/quizzes/course/${courseId}`, {
      params: studentId ? { studentId } : {},
    });
    return response.data; // QuizResponseDTO
  },

  getQuestionsByQuizId: async (quizId) => {
    const response = await api.get(`/api/questions/quiz/${quizId}`);
    return response.data; // List of QuestionResponseDTO
  },

  submitQuiz: async (studentId, quizId, answers) => {
    const response = await api.post("/api/quizzes/submit", {
      studentId,
      quizId,
      answers,
    });
    return response.data; // QuizResultResponseDTO { quizId, score, passed, attempts }
  },

  getQuizResults: async (studentId, quizId) => {
    const response = await api.get(`/api/quizzes/result/${studentId}`, {
      params: quizId ? { quizId } : {},
    });
    return response.data; // List of QuizResultResponseDTO
  },

  createQuiz: async ({ courseId, title, description, published }) => {
    const response = await api.post("/api/quizzes", {
      courseId,
      title,
      description,
      published,
    });
    return response.data;
  },

  updateQuiz: async (quizId, { courseId, title, description, published }) => {
    const response = await api.put(`/api/quizzes/${quizId}`, {
      courseId,
      title,
      description,
      published,
    });
    return response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/api/quizzes/${quizId}`);
    return response.data;
  },

  publishQuiz: async (quizId) => {
    const response = await api.post(`/api/quizzes/${quizId}/publish`);
    return response.data;
  },

  addQuestion: async ({
    quizId,
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
  }) => {
    const response = await api.post("/api/questions", {
      quizId,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    });
    return response.data;
  },

  editQuestion: async (
    questionId,
    { quizId, questionText, optionA, optionB, optionC, optionD, correctAnswer }
  ) => {
    const response = await api.put(`/api/questions/${questionId}`, {
      quizId,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    });
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/api/questions/${questionId}`);
    return response.data;
  },

  // Certificate endpoints (from course-service)
  getCertificatesByStudent: async (studentId) => {
    const response = await api.get(`/api/certificates/student/${studentId}`);
    return response.data; // List of Certificate
  },

  getCertificatePdfBlob: async (studentId, courseId) => {
    const response = await api.get(
      `/api/certificates/${studentId}/${courseId}`,
      {
        responseType: "blob", // critical for downloading PDFs
      }
    );
    return response.data;
  },
};

export default quizService;
