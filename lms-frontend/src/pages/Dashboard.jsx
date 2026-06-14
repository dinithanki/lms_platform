import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import courseService from "../services/courseService";
import enrollmentService from "../services/enrollmentService";
import authService from "../services/authService";
import quizService from "../services/quizService";
import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";
import notificationService from "../services/notificationService";

const Dashboard = () => {
  const { user } = useAuth();

  // Common State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Student specific State
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [studentProgress, setStudentProgress] = useState({});
  const [certificatesCount, setCertificatesCount] = useState(0);

  // Instructor specific State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [courseSubmitLoading, setCourseSubmitLoading] = useState(false);

  // Admin specific State
  const [users, setUsers] = useState([]);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(null);

  // Admin broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastType, setBroadcastType] = useState("UPDATE");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      // 1. Fetch courses (needed by all roles)
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses);

      // 2. Fetch role-specific details
      if (user.role === "STUDENT") {
        // Fetch enrolled courses
        const enrolled = await enrollmentService.getEnrolledCourses(user.id);
        setEnrolledCourses(enrolled);

        // Fetch certificates
        const certificates = await quizService.getCertificatesByStudent(user.id);
        setCertificatesCount(certificates?.length || 0);

        // Fetch progress for each enrolled course
        const progressMap = {};
        for (const c of enrolled) {
          try {
            const prog = await courseService.getCourseProgress(c.id, user.id);
            progressMap[c.id] = prog.progressPercent;
          } catch (e) {
            console.error(`Failed to get progress for course ${c.id}`, e);
            progressMap[c.id] = 0;
          }
        }
        setStudentProgress(progressMap);
      } else if (user.role === "ADMIN") {
        // Fetch all users
        const allUsers = await authService.getAllUsers();
        setUsers(allUsers);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Student enroll handler
  const handleEnroll = async (courseId) => {
    try {
      await enrollmentService.enrollStudent(courseId, user.id);
      // Reload dashboard data to show enrollment updates
      await fetchDashboardData();
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert(err.response?.data?.message || "Failed to enroll in the course.");
    }
  };

  // Instructor create course handler
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    setCourseSubmitLoading(true);
    try {
      await courseService.createCourse(newCourseTitle, newCourseDesc);
      setNewCourseTitle("");
      setNewCourseDesc("");
      setShowCreateModal(false);
      // Refresh course list
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses);
    } catch (err) {
      console.error("Failed to create course", err);
      alert("Failed to create course. Please try again.");
    } finally {
      setCourseSubmitLoading(false);
    }
  };

  // Admin update user role handler
  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdateLoading(userId);
    try {
      await authService.updateUserRole(userId, newRole);
      // Refresh user list
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update user role.");
    } finally {
      setRoleUpdateLoading(null);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;
    setBroadcastLoading(true);
    try {
      await notificationService.createNotification(
        "ALL",
        broadcastTitle,
        broadcastMsg,
        broadcastType
      );
      setBroadcastTitle("");
      setBroadcastMsg("");
      alert("Platform-wide update notification broadcasted successfully!");
    } catch (err) {
      console.error("Failed to broadcast notification:", err);
      alert("Failed to broadcast notification. Please try again.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete the course "${courseTitle}"? This will delete all modules, enrollments, quiz results, and certificates permanently.`);
    if (!confirmDelete) return;

    try {
      await courseService.deleteCourse(courseId);
      alert("Course deleted successfully.");
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to delete course:", err);
      alert(err.response?.data?.message || "Failed to delete course.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Gathering your dashboard data...</p>
        </div>
      </div>
    );
  }

  // RENDER STUDENT DASHBOARD
  if (user.role === "STUDENT") {
    const enrolledIds = enrolledCourses.map((c) => c.id);
    const availableCourses = courses.filter((c) => !enrolledIds.includes(c.id));

    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Banner greeting */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-900/60 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              Welcome to your Learning Space!
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              Track your course progression, finish active syllabus modules, and challenge yourself with final quizzes to obtain downloadable certificates!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all duration-200"
            >
              Explore Catalog
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Enrolled Courses</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{enrolledCourses.length}</p>
            </div>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Certificates Earned</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{certificatesCount}</p>
            </div>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Catalog Size</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{courses.length} Courses</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">My Active Courses</h2>
            {enrolledCourses.length > 0 && (
              <Link to="/my-courses" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                View All
              </Link>
            )}
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-800 bg-slate-900/20 text-center rounded-2xl">
              <p className="text-sm text-slate-400">You are not enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Enroll in your first course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={true}
                  progress={studentProgress[course.id]}
                  userRole={user.role}
                />
              ))}
            </div>
          )}
        </div>

        {/* Available courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Available Courses To Explore</h2>
            <Link to="/courses" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View Catalog
            </Link>
          </div>
          {availableCourses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              You have already enrolled in all available courses!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.slice(0, 3).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={false}
                  onEnroll={handleEnroll}
                  userRole={user.role}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER INSTRUCTOR DASHBOARD
  if (user.role === "INSTRUCTOR") {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Banner greeting */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-purple-900/60 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              Instructor Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              Plan schedules, construct comprehensive modules containing lessons, draft questions to publish quizzes, and view curriculum statistics.
            </p>
          </div>
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Create New Course
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Courses</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{courses.length}</p>
            </div>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Syllabus Modules</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">
                {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
              </p>
            </div>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V19h2v2h-4v-2h2v-2.03a5.008 5.008 0 01-3.536-1.864z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Created Quizzes</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">Active</p>
            </div>
          </div>
        </div>

        {/* Instructor Course Listing */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Course Curriculums</h2>
          {courses.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-800 bg-slate-900/20 text-center rounded-2xl">
              <p className="text-sm text-slate-400">No courses created yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Create your first course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={false}
                  userRole={user.role}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-scaleIn">
              <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                <h3 className="text-base font-bold text-slate-100">Create New Course</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-full hover:bg-slate-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="e.g. Introduction to React & Next.js"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Course Description
                  </label>
                  <textarea
                    rows="4"
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200 resize-none"
                    placeholder="Provide a comprehensive summary of the course topics, structure, and what students will accomplish..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={courseSubmitLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {courseSubmitLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER ADMIN DASHBOARD
  if (user.role === "ADMIN") {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Header Greeting */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-900/60 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              Administrator Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              Global management panel for users, permissions, roles, and learning content settings. Adjust roles to grant student, instructor, or admin access.
            </p>
          </div>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total System Users</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{users.length}</p>
            </div>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Course Catalog</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{courses.length} Courses</p>
            </div>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Microservices</span>
              <p className="text-xl font-bold text-slate-200 mt-0.5">5 Services</p>
            </div>
          </div>
        </div>

        {/* Broadcast System Update Panel */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Broadcast Platform Notification</h3>
              <p className="text-[10px] text-slate-500 font-medium">Send a global update message to all users instantly.</p>
            </div>
          </div>
          <form onSubmit={handleBroadcastSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Broadcast Title</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., Scheduled System Maintenance or New Feature Release"
                  className="bg-slate-800 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none transition-all duration-200"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notification Type</label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="bg-slate-800 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-300 focus:outline-none transition-all duration-200 cursor-pointer"
                >
                  <option value="UPDATE">Platform Update</option>
                  <option value="GUIDELINE">User Guideline</option>
                  <option value="GENERAL">General Notice</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 h-full">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Message Content</label>
                <textarea
                  rows="3"
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Compose your broadcast message details here..."
                  className="bg-slate-800 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none transition-all duration-200 resize-none h-full"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={broadcastLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                {broadcastLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Broadcast Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User Management Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Manage System Users</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800/40 border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No registered users found in Auth Database.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/20 transition-colors duration-150">
                        <td className="px-6 py-4 font-mono text-slate-500">#{item.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-200">{item.name}</td>
                        <td className="px-6 py-4 text-slate-400">{item.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                              item.role === "ADMIN"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : item.role === "INSTRUCTOR"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}
                          >
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
                              disabled={item.email === user.email} // Prevent changing self role
                              className="bg-slate-850 border border-slate-800 bg-slate-800 rounded-lg py-1 px-2.5 text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors duration-150 text-[11px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="STUDENT">Make Student</option>
                              <option value="INSTRUCTOR">Make Instructor</option>
                              <option value="ADMIN">Make Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Courses summary */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Course Management Catalog</h2>
          {courses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              No courses registered in system.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/10 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 truncate w-44">{c.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{c.modules?.length || 0} Modules</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${c.id}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold transition-colors duration-150"
                      >
                        Enter Course
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.title)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg text-[10px] font-semibold transition-all duration-150 cursor-pointer"
                        title="Delete Course"
                      >
                        Delete
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
