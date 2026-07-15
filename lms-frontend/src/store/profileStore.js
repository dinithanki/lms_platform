import { create } from "zustand";
import userService from "../services/userService";
import quizService from "../services/quizService";
import courseService from "../services/courseService";

/**
 * profileStore — manages the user profile, picture upload, and student certificates.
 */
const useProfileStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  profile: null,
  profileImgUrl: null,
  loading: false,
  saveLoading: false,
  uploadLoading: false,
  message: { type: "", text: "" },

  // Form field mirrors (controlled)
  name: "",
  phone: "",
  bio: "",
  selectedFile: null,

  // Student certificates
  certificates: [],
  certCourses: {},          // { [courseId]: courseTitle }
  certificatesLoading: false,
  downloadingCertId: null,

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Fetch profile data + conditionally fetch student certificates. */
  fetchProfileAndData: async (user) => {
    if (!user) return;
    set({ loading: true, message: { type: "", text: "" } });
    try {
      const data = await userService.getProfile();
      set({
        profile: data,
        name: data.name || "",
        phone: data.phone || "",
        bio: data.bio || "",
        profileImgUrl: data.profileImageUrl
          ? userService.getProfilePictureUrl(data.id)
          : null,
      });

      if (user.role === "STUDENT") {
        get().fetchStudentCertificates(data.id);
      }
    } catch (err) {
      console.error(err);
      set({
        message: {
          type: "error",
          text: "Failed to load profile details. Ensure user-service is active.",
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  /** Fetch and resolve student certificates with their course names. */
  fetchStudentCertificates: async (studentId) => {
    set({ certificatesLoading: true });
    try {
      const certs = await quizService.getCertificatesByStudent(studentId);
      set({ certificates: certs });

      const courseMap = {};
      for (const cert of certs) {
        try {
          const c = await courseService.getCourseById(cert.courseId);
          courseMap[cert.courseId] = c.title;
        } catch {
          courseMap[cert.courseId] = `Course ID: #${cert.courseId}`;
        }
      }
      set({ certCourses: courseMap });
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      set({ certificatesLoading: false });
    }
  },

  /** Save updated profile fields. Calls `updateUserProfileLocal` from authStore after. */
  saveProfile: async (updateUserProfileLocal, user) => {
    const { profile, name, phone, bio } = get();
    if (!name.trim()) return;

    set({ saveLoading: true, message: { type: "", text: "" } });
    try {
      const updated = await userService.updateProfile(profile.id, name, phone, bio);
      set({ profile: updated });
      // Propagate name change into auth store so Navbar/Sidebar update instantly
      updateUserProfileLocal({ ...user, name: updated.name });
      set({ message: { type: "success", text: "Profile updated successfully!" } });
    } catch (err) {
      console.error(err);
      set({ message: { type: "error", text: "Failed to update profile details." } });
    } finally {
      set({ saveLoading: false });
    }
  },

  /** Upload a profile picture. */
  uploadProfilePicture: async (updateUserProfileLocal, user) => {
    const { profile, selectedFile } = get();
    if (!selectedFile) return;

    set({ uploadLoading: true, message: { type: "", text: "" } });
    try {
      const updated = await userService.uploadProfilePicture(profile.id, selectedFile);
      const newImgUrl = `${userService.getProfilePictureUrl(updated.id)}?t=${Date.now()}`;
      set({
        profile: updated,
        selectedFile: null,
        profileImgUrl: newImgUrl,
        message: { type: "success", text: "Profile picture uploaded successfully!" },
      });
      // Propagate profileImageUrl change into auth store so Navbar/Sidebar update instantly
      if (updateUserProfileLocal && user) {
        updateUserProfileLocal({
          ...user,
          profileImageUrl: `${updated.profileImageUrl}?t=${Date.now()}`
        });
      }
    } catch (err) {
      console.error(err);
      set({ message: { type: "error", text: "Failed to upload image. Verify size and format." } });
    } finally {
      set({ uploadLoading: false });
    }
  },

  /** Download a certificate PDF. */
  downloadCertificate: async (courseId, title) => {
    const { profile } = get();
    set({ downloadingCertId: courseId });
    try {
      const blob = await quizService.getCertificatePdfBlob(profile.id, courseId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate_${title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download certificate.");
    } finally {
      set({ downloadingCertId: null });
    }
  },

  // ── Field setters ──────────────────────────────────────────────────────────
  setName: (v) => set({ name: v }),
  setPhone: (v) => set({ phone: v }),
  setBio: (v) => set({ bio: v }),
  setSelectedFile: (f) => set({ selectedFile: f }),

  /** Reset on unmount / logout. */
  reset: () =>
    set({
      profile: null,
      profileImgUrl: null,
      loading: false,
      saveLoading: false,
      uploadLoading: false,
      message: { type: "", text: "" },
      name: "",
      phone: "",
      bio: "",
      selectedFile: null,
      certificates: [],
      certCourses: {},
      certificatesLoading: false,
      downloadingCertId: null,
    }),
}));

export default useProfileStore;
