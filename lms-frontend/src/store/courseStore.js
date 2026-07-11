import { create } from "zustand";
import courseService from "../services/courseService";
import enrollmentService from "../services/enrollmentService";
import quizService from "../services/quizService";

/**
 * courseStore — manages course catalog, enrollment, progress, and CRUD operations.
 */
const useCourseStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  courses: [],
  enrolledCourses: [],
  studentProgress: {}, // { [courseId]: progressPercent }
  loading: false,
  error: "",

  // Per-course enroll-in-progress map: { [courseId]: true }
  enrollLoadingMap: {},

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch all courses + enrolled courses + progress (for a student) */
  fetchCoursesAndEnrollment: async (user) => {
    set({ loading: true, error: "" });
    try {
      const allCourses = await courseService.getAllCourses();
      set({ courses: allCourses });

      if (user && user.role === "STUDENT") {
        const enrolled = await enrollmentService.getEnrolledCourses(user.id);
        set({ enrolledCourses: enrolled });

        // Progress for each enrolled course
        const progressMap = {};
        for (const c of enrolled) {
          try {
            const prog = await courseService.getCourseProgress(c.id, user.id);
            progressMap[c.id] = prog.progressPercent;
          } catch {
            progressMap[c.id] = 0;
          }
        }
        set({ studentProgress: progressMap });
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      set({ error: "Unable to load course catalog. Please ensure services are active." });
    } finally {
      set({ loading: false });
    }
  },

  /** Enroll student in a course and refresh. */
  enrollStudent: async (courseId, user) => {
    set((s) => ({ enrollLoadingMap: { ...s.enrollLoadingMap, [courseId]: true } }));
    try {
      await enrollmentService.enrollStudent(courseId, user.id);
      await get().fetchCoursesAndEnrollment(user);
    } catch (err) {
      console.error("Enrollment failed:", err);
      throw err;
    } finally {
      set((s) => ({ enrollLoadingMap: { ...s.enrollLoadingMap, [courseId]: false } }));
    }
  },

  /** Create a new course (instructor). */
  createCourse: async (title, description) => {
    await courseService.createCourse(title, description);
    // Refresh course list
    const allCourses = await courseService.getAllCourses();
    set({ courses: allCourses });
  },

  /** Delete a course (admin/instructor) — also tries to delete its quiz first. */
  deleteCourse: async (courseId) => {
    try {
      const quiz = await quizService.getQuizByCourseId(courseId);
      if (quiz && quiz.id) {
        await quizService.deleteQuiz(quiz.id);
      }
    } catch {
      // Quiz may not exist, that is fine
    }
    await courseService.deleteCourse(courseId);
    const allCourses = await courseService.getAllCourses();
    set({ courses: allCourses });
  },

  /** Clear all course data (e.g. on logout). */
  reset: () =>
    set({
      courses: [],
      enrolledCourses: [],
      studentProgress: {},
      loading: false,
      error: "",
      enrollLoadingMap: {},
    }),
}));

export default useCourseStore;
