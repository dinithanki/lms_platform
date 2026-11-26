import React, { useEffect } from "react";
import { useAuth } from "../store/authStore";
import useCourseStore from "../store/courseStore";
import useDashboardStore from "../store/dashboardStore";
import quizService from "../services/quizService";
import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";
import { useDialogStore } from "../store/dialogStore";

const MetricCard = ({ label, value, detail, tone = "blue", icon = "book" }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    green: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  };
  const icons = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/></>,
    award: <><circle cx="12" cy="8" r="6"/><path d="m8.2 13-1 8 4.8-2.8 4.8 2.8-1-8"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    teaching: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v5m-4 0h8M8 9h8m-8 3h5"/></>,
  };
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--app-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-heading)]">{value}</p>
          {detail && <p className="mt-1 text-xs text-[var(--app-muted)]">{detail}</p>}
        </div>
        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.blue}`}>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[icon] || icons.book}</svg>
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  // Course store
  const {
    courses,
    enrolledCourses,
    studentProgress,
    loading,
    error,
    fetchCoursesAndEnrollment,
    enrollStudent,
    createCourse,
    deleteCourse,
  } = useCourseStore();

  // Dashboard/admin store
  const {
    users,
    usersError,
    roleUpdateLoading,
    userDeleteLoading,
    showCreateModal,
    newCourseTitle,
    newCourseDesc,
    courseSubmitLoading,
    fetchUsers,
    updateUserRole,
    deleteUser,
    openCreateModal,
    closeCreateModal,
    setNewCourseTitle,
    setNewCourseDesc,
    setCourseSubmitLoading,
  } = useDashboardStore();

  // Certificate count — student only (derived from enrolled courses + quiz store)
  const [certificatesCount, setCertificatesCount] = React.useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    await fetchCoursesAndEnrollment(user);

    if (user.role === "ADMIN") {
      await fetchUsers();
    }

    if (user.role === "STUDENT") {
      try {
        const certs = await quizService.getCertificatesByStudent(user.id);
        setCertificatesCount(certs?.length || 0);
      } catch {
        setCertificatesCount(null);
      }
    }
  };

  // Student enroll
  const handleEnroll = async (courseId) => {
    try {
      await enrollStudent(courseId, user);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll in the course.");
    }
  };

  // Instructor create course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    setCourseSubmitLoading(true);
    try {
      await createCourse(newCourseTitle, newCourseDesc);
      closeCreateModal();
    } catch (err) {
      alert("Failed to create course. Please try again.");
    } finally {
      setCourseSubmitLoading(false);
    }
  };

  // Admin update role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
    } catch {
      alert("Failed to update user role.");
    }
  };

  // Admin delete user
  const handleDeleteUser = async (userId, userName) => {
    const confirmed = await useDialogStore.getState().showConfirm(
      `Are you sure you want to permanently delete user "${userName}"? This will also delete their profile.`,
      "Delete User"
    );
    if (!confirmed) return;
    try {
      await deleteUser(userId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user. Please try again.");
    }
  };

  // Admin/instructor delete course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = await useDialogStore.getState().showConfirm(
      `Are you sure you want to permanently delete course "${courseTitle}"?`,
      "Delete Course"
    );
    if (!confirmed) return;
    try {
      await deleteCourse(courseId);
      alert("Course successfully deleted.");
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-navy-400 font-medium">Gathering your dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-[var(--app-surface)] p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-[var(--app-heading)]">Dashboard data is unavailable</h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">{error}</p>
        <button type="button" onClick={fetchDashboardData} className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Try again</button>
      </div>
    );
  }

  // ─── STUDENT DASHBOARD ────────────────────────────────────────────────────
  if (user.role === "STUDENT") {
    const enrolledIds = enrolledCourses.map((c) => c.id);
    const availableCourses = courses.filter((c) => !enrolledIds.includes(c.id));
    const progressValues = enrolledCourses
      .map((course) => studentProgress[course.id])
      .filter((value) => Number.isFinite(value));
    const completedCourses = progressValues.filter((value) => value >= 100).length;
    const averageProgress = progressValues.length
      ? Math.round(progressValues.reduce((total, value) => total + value, 0) / progressValues.length)
      : null;

    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Modern Interactive Banner */}
        <div className="dashboard-role-banner relative p-6 md:p-8 bg-gradient-to-br from-accent-900/60 via-navy-800 to-navy-850 rounded-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-navy-700/40">
          {/* Glassmorphic glows */}
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-accent-500/8 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/8 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <span className="dashboard-role-banner-badge dashboard-student-banner-badge text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 bg-accent-600/15 text-accent-300 border border-accent-600/25 rounded-full">
              Student Workspace
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-3.5 font-display tracking-tight leading-tight">
              Welcome back to your Learning Space, {user?.name}!
            </h1>
            <p className="text-sm text-navy-300 mt-2 max-w-xl leading-relaxed">
              Resume your active syllabus classes, check off module milestones, and pass final quizzes to obtain certified, downloadable credentials.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link to="/courses" className="dashboard-role-banner-action px-5 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg inline-block border border-white/10">
              Explore Catalog
            </Link>
          </div>
        </div>

        <section aria-label="Your learning summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Enrolled courses" value={enrolledCourses.length} detail="Courses on your learning list" tone="blue" icon="book" />
          <MetricCard label="Completed courses" value={progressValues.length ? completedCourses : "—"} detail={progressValues.length ? `Based on ${progressValues.length} courses with progress data` : "Progress data unavailable"} tone="green" icon="check" />
          <MetricCard label="Average progress" value={averageProgress == null ? "—" : `${averageProgress}%`} detail={progressValues.length ? `Across ${progressValues.length} courses with available progress` : "Progress data unavailable"} tone="violet" icon="chart" />
          <MetricCard label="Certificates earned" value={certificatesCount == null ? "—" : certificatesCount} detail={certificatesCount == null ? "Certificate data unavailable" : "From your completed learning"} tone="amber" icon="award" />
        </section>
        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">My Courses</h2>
            {enrolledCourses.length > 0 && (
              <Link to="/my-courses" className="text-sm text-accent-400 hover:text-accent-300 font-semibold transition-colors">
                View All Courses
              </Link>
            )}
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="p-10 border border-dashed border-navy-700/50 bg-navy-800/50 text-center rounded-2xl">
              <p className="text-sm text-navy-400">You are not enrolled in any study courses yet.</p>
              <Link to="/courses" className="inline-block mt-4 px-4 py-2.5 bg-accent-600 hover:bg-accent-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent-600/15">
                Browse Course Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} isEnrolled={true} progress={studentProgress[course.id]} userRole={user.role} />
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-display">Available Courses</h2>
            <Link to="/courses" className="text-sm text-accent-400 hover:text-accent-300 font-semibold transition-colors">
              Explore Full Library
            </Link>
          </div>
          {availableCourses.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-400 bg-navy-800/50 border border-navy-700/40 rounded-2xl">
              You are currently enrolled in all courses in the catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} isEnrolled={false} onEnroll={handleEnroll} userRole={user.role} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── INSTRUCTOR DASHBOARD ─────────────────────────────────────────────────
  if (user.role === "INSTRUCTOR") {
    const moduleCount = courses.reduce((total, course) => total + (course.modules?.length || 0), 0);
    const coursesWithModules = courses.filter((course) => (course.modules?.length || 0) > 0).length;
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Premium Banner */}
        <div className="dashboard-role-banner relative p-6 md:p-8 bg-gradient-to-br from-purple-700/40 via-navy-800 to-navy-850 border border-navy-700/40 rounded-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <span className="dashboard-role-banner-badge dashboard-instructor-banner-badge text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 bg-purple-600/15 text-purple-300 border border-purple-600/25 rounded-full">
              Instructor Panel
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-3.5 font-display">Instructor Console</h1>
            <p className="text-sm text-navy-300 mt-1.5 max-w-xl leading-relaxed">
              Construct comprehensive modules, attach video streaming references, structure interactive final quizzes, and oversee curricular catalogs.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={openCreateModal}
              className="dashboard-role-banner-action px-5 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Publish New Course
            </button>
          </div>
        </div>

        <section aria-label="Course catalog summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Courses in catalog" value={courses.length} detail="All courses returned by the course service" tone="blue" icon="book" />
          <MetricCard label="Modules in catalog" value={moduleCount} detail="Across available course records" tone="violet" icon="layers" />
          <MetricCard label="Courses with modules" value={coursesWithModules} detail="Courses with at least one lesson" tone="green" icon="check" />
        </section>
        {/* Course Listing */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-display">Course Catalog</h2>
          {courses.length === 0 ? (
            <div className="p-10 border border-dashed border-navy-700/50 bg-navy-800/50 text-center rounded-2xl">
              <p className="text-sm text-navy-400">No courses created yet.</p>
              <button onClick={openCreateModal} className="mt-4 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-lg shadow-purple-600/15">
                Launch your first course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} isEnrolled={false} userRole={user.role} />
              ))}
            </div>
          )}
        </div>

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={closeCreateModal}></div>
            <div className="w-full max-w-md bg-navy-800 border border-navy-700/40 rounded-2xl p-6 shadow-2xl shadow-black/40 z-10 animate-scaleIn">
              <div className="flex justify-between items-center mb-5 border-b border-navy-700/30 pb-3">
                <h3 className="text-base font-bold text-white font-display">Launch New Course</h3>
                <button onClick={closeCreateModal} className="p-1.5 text-navy-400 hover:text-white rounded-lg hover:bg-navy-700/50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Course Title</label>
                  <input type="text" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} className="w-full bg-navy-850 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-2.5 px-3.5 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200" placeholder="e.g. Introduction to React & Next.js" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Course Description</label>
                  <textarea rows="4" value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} className="w-full bg-navy-850 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-2.5 px-3.5 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200 resize-none" placeholder="Provide a comprehensive summary of the course topics..." required />
                </div>
                <button type="submit" disabled={courseSubmitLoading} className="w-full bg-purple-600 hover:bg-purple-500 active:scale-[0.98] disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-sm rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/15">
                  {courseSubmitLoading ? (
                    <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>Creating...</>
                  ) : "Create Course"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────
  if (user.role === "ADMIN") {
    const studentUsers = users.filter((account) => account.role === "STUDENT").length;
    const instructorUsers = users.filter((account) => account.role === "INSTRUCTOR").length;
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Premium Control Banner */}
        <div className="dashboard-admin-banner relative p-6 md:p-8 bg-gradient-to-br from-accent-900/50 via-navy-800 to-navy-850 rounded-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-navy-700/40">
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-accent-500/8 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <span className="dashboard-admin-banner-badge text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 bg-accent-600/15 text-accent-300 border border-accent-600/25 rounded-full">
              System Admin
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-3.5 font-display tracking-tight leading-tight">Administrator Dashboard</h1>
            <p className="text-sm text-navy-300 mt-1.5 max-w-xl leading-relaxed">
              Review registered accounts, update access roles, and manage platform users.
            </p>
          </div>
        </div>

        <section aria-label="Platform summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Registered users" value={usersError ? "—" : users.length} detail={usersError || "Accounts returned by Auth Service"} tone="blue" icon="users" />
          <MetricCard label="Students" value={usersError ? "—" : studentUsers} detail="Student accounts" tone="green" icon="book" />
          <MetricCard label="Instructors" value={usersError ? "—" : instructorUsers} detail="Instructor accounts" tone="violet" icon="teaching" />
          <MetricCard label="Courses in catalog" value={courses.length} detail="Course Service records" tone="amber" icon="layers" />
        </section>

        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-base font-semibold text-[var(--app-heading)]">User management</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">Search accounts, review roles, update access, and remove accounts when needed.</p>
          </div>
          <Link to="/admin/users" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:mt-0">Manage users</Link>
        </section>
        {/* Course Management */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 font-display">Course Registry Management</h2>
          {courses.length === 0 ? (
            <div className="p-6 text-center text-sm text-navy-400 bg-navy-800/50 border border-navy-700/40 rounded-2xl">
              No courses registered in system.
            </div>
          ) : (
            <div className="bg-navy-800 border border-navy-700/40 rounded-2xl overflow-hidden p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="p-4 bg-navy-850 rounded-xl border border-navy-700/30 flex items-center justify-between">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate w-40">{c.title}</h4>
                      <p className="text-[11px] text-navy-400 font-medium uppercase tracking-wider mt-0.5">{c.modules?.length || 0} Lessons</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/courses/${c.id}`} className="px-3 py-1.5 bg-navy-700/50 hover:bg-navy-700 border border-navy-700/40 text-navy-200 hover:text-accent-400 rounded-xl text-[11px] font-semibold transition-all">
                        Enter
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="p-1.5 bg-danger-700/20 hover:bg-danger-700/40 text-danger-400 rounded-xl transition-all duration-150 cursor-pointer border border-danger-700/30"
                        title="Delete Course"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
