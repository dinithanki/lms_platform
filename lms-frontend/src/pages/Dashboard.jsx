import React, { useEffect } from "react";
import { useAuth } from "../store/authStore";
import useCourseStore from "../store/courseStore";
import useDashboardStore from "../store/dashboardStore";
import quizService from "../services/quizService";
import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";

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
  const [certificatesCount, setCertificatesCount] = React.useState(0);

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
        setCertificatesCount(0);
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
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This will also delete their profile.`)) return;
    try {
      await deleteUser(userId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user. Please try again.");
    }
  };

  // Admin/instructor delete course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${courseTitle}"?`)) return;
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
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Gathering your dashboard data...</p>
        </div>
      </div>
    );
  }

  // ─── STUDENT DASHBOARD ────────────────────────────────────────────────────
  if (user.role === "STUDENT") {
    const enrolledIds = enrolledCourses.map((c) => c.id);
    const availableCourses = courses.filter((c) => !enrolledIds.includes(c.id));

    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Modern Interactive Banner */}
        <div className="relative p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800/40">
          {/* Glassmorphic glows */}
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <span className="text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-full font-display">
              Student Workspace
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white mt-3.5 font-display tracking-tight leading-tight">
              Welcome back to your Learning Space, {user?.name}!
            </h1>
            <p className="text-xs text-slate-350 mt-2 max-w-xl leading-relaxed">
              Resume your active syllabus classes, check off module milestones, and pass final quizzes to obtain certified, downloadable credentials.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link to="/courses" className="px-5 py-3 bg-white hover:bg-slate-50 active:scale-[0.98] text-indigo-700 rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg inline-block font-display">
              Explore Catalog
            </Link>
          </div>
        </div>

        {/* Stats Widgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all duration-250 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-display">Enrolled Courses</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-2xl font-black text-slate-800 font-display">{enrolledCourses.length}</p>
                {enrolledCourses.length > 0 && (
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-display">
                    +1 Ongoing
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all duration-250 group">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-display">Certificates Earned</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-2xl font-black text-slate-800 font-display">{certificatesCount}</p>
                {certificatesCount > 0 && (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-display">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all duration-250 group">
            <div className="p-3 bg-purple-50 text-purple-650 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-display">LMS Catalog Size</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-2xl font-black text-slate-800 font-display">{courses.length}</p>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-display">
                  Published
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-display">My Enrolled Lectures</h2>
            {enrolledCourses.length > 0 && (
              <Link to="/my-courses" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors font-display">
                View All Courses
              </Link>
            )}
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-200 bg-white text-center rounded-3xl shadow-sm">
              <p className="text-xs text-slate-500">You are not enrolled in any study courses yet.</p>
              <Link to="/courses" className="inline-block mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10">
                Browse Recommended Courses
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
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-display">Recommended For You</h2>
            <Link to="/courses" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors font-display">
              Explore Full Library
            </Link>
          </div>
          {availableCourses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
              You are currently enrolled in all available curricular programs!
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
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Premium Banner */}
        <div className="relative p-6 md:p-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 border border-purple-500/20 rounded-3xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-purple-100/80">
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <span className="text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 bg-white/15 text-purple-50 border border-white/10 rounded-full">
              Instructor Panel
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-3.5">Instructor Console</h1>
            <p className="text-xs text-purple-100/90 mt-1.5 max-w-xl leading-relaxed">
              Construct comprehensive modules, attach video streaming references, structure interactive final quizzes, and oversee curricular catalogs.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={openCreateModal}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-purple-700 rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-purple-650" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Publish New Course
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/40 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-450 block">Managed Courses</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">{courses.length}</p>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/40 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-purple-50 text-purple-650 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-450 block">Syllabus Chapters</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
              </p>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/40 hover:shadow-md transition-all duration-200 group">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V19h2v2h-4v-2h2v-2.03a5.008 5.008 0 01-3.536-1.864z" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-450 block">Quiz Assessments</span>
              <p className="text-xl font-extrabold text-slate-800 mt-0.5">Active</p>
            </div>
          </div>
        </div>

        {/* Course Listing */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Course Curriculums</h2>
          {courses.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-200 bg-white text-center rounded-3xl shadow-sm">
              <p className="text-xs text-slate-500">No courses created yet.</p>
              <button onClick={openCreateModal} className="mt-4 px-4 py-2.5 bg-purple-650 hover:bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-purple-600/10">
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
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeCreateModal}></div>
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl shadow-slate-200/50 z-10 animate-scaleIn">
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-800">Launch New Course</h3>
                <button onClick={closeCreateModal} className="p-1.5 text-slate-450 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450 ml-1">Course Title</label>
                  <input type="text" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200" placeholder="e.g. Introduction to React & Next.js" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450 ml-1">Course Description</label>
                  <textarea rows="4" value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white transition-all duration-200 resize-none" placeholder="Provide a comprehensive summary of the course topics..." required />
                </div>
                <button type="submit" disabled={courseSubmitLoading} className="w-full bg-purple-650 hover:bg-purple-600 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-650/10">
                  {courseSubmitLoading ? (
                    <><div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>Creating...</>
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
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Premium Control Banner */}
        <div className="relative p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800/40">
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-slate-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1">
            <span className="text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-full font-display">
              System Admin
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white mt-3.5 font-display tracking-tight leading-tight">Administrator Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              Global control deck for allocating user roles, auditing system profiles, managing registered courses, and monitoring cluster microservices.
            </p>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all duration-250 group">
            <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-display">System Members</span>
              <p className="text-2xl font-black text-slate-800 font-display mt-0.5">{users.length}</p>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all duration-250 group">
            <div className="p-3 bg-purple-50 text-purple-650 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-display">Total Curriculums</span>
              <p className="text-2xl font-black text-slate-800 font-display mt-0.5">{courses.length}</p>
            </div>
          </div>
          <div className="p-5 bg-white border border-slate-200/50 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/30 hover:shadow-md transition-all duration-250 group">
            <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
              </svg>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-display">Microservices</span>
              <p className="text-2xl font-black text-slate-800 font-display mt-0.5">Online</p>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4 font-display">Manage System Users</h2>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/50">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-bold tracking-widest text-slate-500">
                    <th className="px-6 py-4.5">ID</th>
                    <th className="px-6 py-4.5">Name</th>
                    <th className="px-6 py-4.5">Email Address</th>
                    <th className="px-6 py-4.5">Current Role</th>
                    <th className="px-6 py-4.5 text-right">Access Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No registered users found in Auth Database.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 font-mono text-slate-400">#{item.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                        <td className="px-6 py-4 text-slate-500">{item.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                            item.role === "ADMIN"
                              ? "bg-rose-50 text-rose-705 border-rose-100"
                              : item.role === "INSTRUCTOR"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : "bg-indigo-50 text-indigo-700 border-indigo-100"
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3 min-h-[50px]">
                          {roleUpdateLoading === item.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <select
                              value={item.role}
                              onChange={(e) => handleRoleChange(item.id, e.target.value)}
                              disabled={item.email === user.email || userDeleteLoading === item.id}
                              className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors duration-150 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-semibold"
                            >
                              <option value="STUDENT">Student Access</option>
                              <option value="INSTRUCTOR">Instructor Access</option>
                              <option value="ADMIN">Admin Access</option>
                            </select>
                          )}
                          {userDeleteLoading === item.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(item.id, item.name)}
                              disabled={item.email === user.email || roleUpdateLoading === item.id}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-30 disabled:hover:bg-rose-50 rounded-xl transition-all duration-150 cursor-pointer border border-rose-150"
                              title="Delete User"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="flex flex-col gap-4 md:hidden p-4 bg-slate-50/30">
              {users.length === 0 ? (
                <div className="text-center text-slate-400 py-6 text-xs">
                  No registered users found in Auth Database.
                </div>
              ) : (
                users.map((item) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col gap-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-mono text-slate-400 text-[10px]">#{item.id}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                        item.role === "ADMIN"
                          ? "bg-rose-50 text-rose-705 border-rose-100"
                          : item.role === "INSTRUCTOR"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-indigo-50 text-indigo-700 border-indigo-100"
                      }`}>
                        {item.role}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{item.name}</h4>
                      <p className="text-slate-500 text-[11px] truncate">{item.email}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Actions</span>
                      <div className="flex items-center gap-2">
                        {roleUpdateLoading === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <select
                            value={item.role}
                            onChange={(e) => handleRoleChange(item.id, e.target.value)}
                            disabled={item.email === user.email || userDeleteLoading === item.id}
                            className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-slate-705 focus:outline-none focus:border-indigo-500 transition-colors duration-150 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-semibold"
                          >
                            <option value="STUDENT">Student Access</option>
                            <option value="INSTRUCTOR">Instructor Access</option>
                            <option value="ADMIN">Admin Access</option>
                          </select>
                        )}
                        {userDeleteLoading === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(item.id, item.name)}
                            disabled={item.email === user.email || roleUpdateLoading === item.id}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-30 disabled:hover:bg-rose-50 rounded-xl transition-all duration-150 cursor-pointer border border-rose-150"
                            title="Delete User"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Course Management */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">Course Registry Management</h2>
          {courses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-sm">
              No courses registered in system.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/55 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-sm shadow-slate-100">
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate w-40">{c.title}</h4>
                      <p className="text-[9px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">{c.modules?.length || 0} Lessons</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/courses/${c.id}`} className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-indigo-650 rounded-xl text-[10px] font-bold transition-all shadow-sm">
                        Enter
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 rounded-xl transition-all duration-150 cursor-pointer border border-rose-150"
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
