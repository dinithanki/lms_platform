import { create } from "zustand";
import quizService from "../services/quizService";

/**
 * quizStore — manages quiz metadata, questions, student results, and quiz attempts.
 * Used by CourseDetails for both instructor (create/publish) and student (take/submit) flows.
 */
const useQuizStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  quiz: null,
  quizQuestions: [],
  quizResults: [],     // Student attempt history
  quizLoading: false,

  // Student active attempt state
  isTakingQuiz: false,
  quizAnswers: {},            // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  quizSubmitLoading: false,
  latestAttemptResult: null,
  downloadingCert: false,

  // Instructor form loading
  quizSubmitLoadingInst: false,
  qSubmitLoading: false,

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch quiz, questions, and student results for a course. */
  fetchQuizDetails: async (courseId, user) => {
    set({ quizLoading: true });
    try {
      const quizData = await quizService.getQuizByCourseId(
        courseId,
        user?.role === "STUDENT" ? user.id : null
      );
      set({ quiz: quizData });

      if (quizData) {
        const questions = await quizService.getQuestionsByQuizId(quizData.id);
        set({ quizQuestions: questions });

        if (user?.role === "STUDENT") {
          const attempts = await quizService.getQuizResults(user.id, quizData.id);
          set({ quizResults: attempts });
        }
      } else {
        set({ quizQuestions: [], quizResults: [] });
      }
    } catch {
      set({ quiz: null, quizQuestions: [] });
    } finally {
      set({ quizLoading: false });
    }
  },

  /** Student: submit a quiz attempt. */
  submitQuiz: async (user, answers) => {
    const { quiz, quizQuestions } = get();
    if (!quiz) return;

    if (Object.keys(answers).length < quizQuestions.length) {
      throw new Error("Please answer all questions before submitting.");
    }

    set({ quizSubmitLoading: true });
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: parseInt(qId),
        selectedOption: ans,
      }));
      const result = await quizService.submitQuiz(user.id, quiz.id, formattedAnswers);
      set({
        latestAttemptResult: result,
        isTakingQuiz: false,
        quizAnswers: {},
      });
      return result;
    } finally {
      set({ quizSubmitLoading: false });
    }
  },

  /** Instructor: create a new quiz for a course. */
  createQuiz: async (payload) => {
    set({ quizSubmitLoadingInst: true });
    try {
      await quizService.createQuiz(payload);
    } finally {
      set({ quizSubmitLoadingInst: false });
    }
  },

  /** Instructor: publish a quiz. */
  publishQuiz: async () => {
    const { quiz } = get();
    if (!quiz) return;
    await quizService.publishQuiz(quiz.id);
  },

  /** Instructor: add a question to the current quiz. */
  addQuestion: async (payload) => {
    set({ qSubmitLoading: true });
    try {
      await quizService.addQuestion(payload);
    } finally {
      set({ qSubmitLoading: false });
    }
  },

  /** Instructor: delete a question. */
  deleteQuestion: async (questionId) => {
    await quizService.deleteQuestion(questionId);
  },

  // ── UI Helpers ─────────────────────────────────────────────────────────────
  setIsTakingQuiz: (val) => set({ isTakingQuiz: val }),
  setQuizAnswers: (updater) =>
    set((s) => ({
      quizAnswers: typeof updater === "function" ? updater(s.quizAnswers) : updater,
    })),
  setDownloadingCert: (val) => set({ downloadingCert: val }),
  setLatestAttemptResult: (val) => set({ latestAttemptResult: val }),

  /** Reset quiz state when navigating away from a course. */
  reset: () =>
    set({
      quiz: null,
      quizQuestions: [],
      quizResults: [],
      quizLoading: false,
      isTakingQuiz: false,
      quizAnswers: {},
      quizSubmitLoading: false,
      latestAttemptResult: null,
      downloadingCert: false,
      quizSubmitLoadingInst: false,
      qSubmitLoading: false,
    }),
}));

export default useQuizStore;
