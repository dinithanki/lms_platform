import { create } from "zustand";
import authService from "../services/authService";

/**
 * dashboardStore — manages admin-specific state: user list, role update, delete.
 * Also used by Dashboard.jsx for instructor course-create modal state.
 */
const useDashboardStore = create((set) => ({
  // ── Admin State ────────────────────────────────────────────────────────────
  users: [],
  roleUpdateLoading: null,   // userId currently being updated
  userDeleteLoading: null,   // userId currently being deleted

  // ── Instructor Modal State ─────────────────────────────────────────────────
  showCreateModal: false,
  newCourseTitle: "",
  newCourseDesc: "",
  courseSubmitLoading: false,

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch all registered users (admin only). */
  fetchUsers: async () => {
    try {
      const allUsers = await authService.getAllUsers();
      set({ users: allUsers });
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  },

  /** Update a user's role. */
  updateUserRole: async (userId, newRole) => {
    set({ roleUpdateLoading: userId });
    try {
      await authService.updateUserRole(userId, newRole);
      const allUsers = await authService.getAllUsers();
      set({ users: allUsers });
    } catch (err) {
      console.error("Failed to update role:", err);
      throw err;
    } finally {
      set({ roleUpdateLoading: null });
    }
  },

  /** Delete a user. */
  deleteUser: async (userId) => {
    set({ userDeleteLoading: userId });
    try {
      await authService.deleteUser(userId);
      const allUsers = await authService.getAllUsers();
      set({ users: allUsers });
    } catch (err) {
      console.error("Failed to delete user:", err);
      throw err;
    } finally {
      set({ userDeleteLoading: null });
    }
  },

  // ── Modal helpers ──────────────────────────────────────────────────────────
  openCreateModal: () => set({ showCreateModal: true }),
  closeCreateModal: () =>
    set({ showCreateModal: false, newCourseTitle: "", newCourseDesc: "" }),
  setNewCourseTitle: (v) => set({ newCourseTitle: v }),
  setNewCourseDesc: (v) => set({ newCourseDesc: v }),
  setCourseSubmitLoading: (v) => set({ courseSubmitLoading: v }),

  /** Reset on logout. */
  reset: () =>
    set({
      users: [],
      roleUpdateLoading: null,
      userDeleteLoading: null,
      showCreateModal: false,
      newCourseTitle: "",
      newCourseDesc: "",
      courseSubmitLoading: false,
    }),
}));

export default useDashboardStore;
