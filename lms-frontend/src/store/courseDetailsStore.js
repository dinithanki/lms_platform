import { create } from "zustand";
import courseService from "../services/courseService";
import enrollmentService from "../services/enrollmentService";

/**
 * courseDetailsStore — manages a single course's full detail page state:
 * course data, modules, enrollment status, student progress, and instructor module form.
 * Reset whenever the user navigates to a different course.
 */
const useCourseDetailsStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  course: null,
  loading: false,
  error: "",
  isEnrolled: false,
  enrollLoading: false,

  // Student progress
  progress: null,
  completingModuleId: null,

  // Selected module for video player (student)
  selectedModule: null,

  // Instructor module form
  showModuleModal: false,
  editingModule: null,
  modTitle: "",
  modVideo: "",
  modResource: "",
  modSubmitLoading: false,

  // Active tab: 'syllabus' | 'quiz'
  activeTab: "syllabus",

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch course + modules + enrollment + progress. */
  fetchCourseDetails: async (courseId, user) => {
    set({ loading: true, error: "" });
    try {
      const data = await courseService.getCourseById(courseId);
      const modules = await courseService.getModules(courseId);
      const course = { ...data, modules };
      set({ course });

      if (user) {
        if (user.role === "STUDENT") {
          const enrolledList = await enrollmentService.getEnrolledCourses(user.id);
          const enrolled = enrolledList.some((c) => c.id === parseInt(courseId));
          set({ isEnrolled: enrolled });

          if (enrolled) {
            const prog = await courseService.getCourseProgress(courseId, user.id);
            set({ progress: prog });

            if (modules && modules.length > 0) {
              const incomplete = modules.find(
                (m) => !prog.completedModuleIds || !prog.completedModuleIds.includes(m.id)
              );
              set({ selectedModule: incomplete || modules[0] });
            }
          }
        } else {
          // Instructors and Admins always have access
          set({ isEnrolled: true });
        }
      }
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load course details. Make sure services are running." });
    } finally {
      set({ loading: false });
    }
  },

  /** Refresh just course + modules (after module CRUD). */
  refreshCourse: async (courseId) => {
    const data = await courseService.getCourseById(courseId);
    const modules = await courseService.getModules(courseId);
    set({ course: { ...data, modules } });
  },

  /** Student: enroll in this course. */
  enrollStudent: async (courseId, user) => {
    set({ enrollLoading: true });
    try {
      await enrollmentService.enrollStudent(courseId, user.id);
      set({ isEnrolled: true });
      const prog = await courseService.getCourseProgress(courseId, user.id);
      set({ progress: prog });
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ enrollLoading: false });
    }
  },

  /** Student: mark a module as completed and refresh progress. */
  completeModule: async (moduleId, courseId, user) => {
    set({ completingModuleId: moduleId });
    try {
      await courseService.completeModule(moduleId, user.id);
      const prog = await courseService.getCourseProgress(courseId, user.id);
      set({ progress: prog });
      await get().refreshCourse(courseId);

      // Keep selectedModule in sync
      const { course, selectedModule } = get();
      if (selectedModule && selectedModule.id === moduleId && course?.modules) {
        const updatedMod = course.modules.find((m) => m.id === moduleId);
        if (updatedMod) set({ selectedModule: updatedMod });
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ completingModuleId: null });
    }
  },

  /** Instructor: create or update a module. */
  saveModule: async (courseId, editingModule, modTitle, modVideo, modResource) => {
    set({ modSubmitLoading: true });
    try {
      if (editingModule) {
        await courseService.updateModule(editingModule.id, {
          title: modTitle,
          videoUrl: modVideo,
          resourceUrl: modResource,
        });
      } else {
        await courseService.createModule(courseId, {
          title: modTitle,
          videoUrl: modVideo,
          resourceUrl: modResource,
        });
      }
      get().closeModuleModal();
      await get().refreshCourse(courseId);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      set({ modSubmitLoading: false });
    }
  },

  // ── Module modal helpers ───────────────────────────────────────────────────
  openCreateModule: () =>
    set({
      showModuleModal: true,
      editingModule: null,
      modTitle: "",
      modVideo: "",
      modResource: "",
    }),

  openEditModule: (mod) =>
    set({
      showModuleModal: true,
      editingModule: mod,
      modTitle: mod.title,
      modVideo: mod.videoUrl,
      modResource: mod.resourceUrl || "",
    }),

  closeModuleModal: () =>
    set({
      showModuleModal: false,
      editingModule: null,
      modTitle: "",
      modVideo: "",
      modResource: "",
    }),

  setModTitle: (v) => set({ modTitle: v }),
  setModVideo: (v) => set({ modVideo: v }),
  setModResource: (v) => set({ modResource: v }),
  setSelectedModule: (mod) => set({ selectedModule: mod }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  /** Full reset when leaving the page. */
  reset: () =>
    set({
      course: null,
      loading: false,
      error: "",
      isEnrolled: false,
      enrollLoading: false,
      progress: null,
      completingModuleId: null,
      selectedModule: null,
      showModuleModal: false,
      editingModule: null,
      modTitle: "",
      modVideo: "",
      modResource: "",
      modSubmitLoading: false,
      activeTab: "syllabus",
    }),
}));

export default useCourseDetailsStore;
