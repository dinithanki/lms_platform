import React, { useEffect } from "react";
import { useAuth } from "../store/authStore";
import useCourseStore from "../store/courseStore";
import quizService from "../services/quizService";
import CourseCard from "../components/CourseCard";

const Courses = () => {
  const { user } = useAuth();
  const {
    courses,
    enrolledCourses,
    studentProgress,
    loading,
    error,
    enrollLoadingMap,
    fetchCoursesAndEnrollment,
    enrollStudent,
    deleteCourse,
  } = useCourseStore();

  // Local UI-only state
  const [searchTerm, setSearchTerm] = React.useState("");

  useEffect(() => {
    fetchCoursesAndEnrollment(user);
  }, [user]);

  const handleEnroll = async (courseId) => {
    try {
      await enrollStudent(courseId, user);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll in the course.");
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete course "${courseTitle}"? This will delete all modules, progress, enrollments, quiz results, certificates, and the quiz associated with this course.`
      )
    ) {
      return;
    }
    try {
      await deleteCourse(courseId);
      alert("Course successfully deleted.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete the course. Please try again.");
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const enrolledIds = enrolledCourses.map((c) => c.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading course catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Title Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight leading-tight">Course Catalog</h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Browse through all learning courses available in the LMS microservices platform
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all duration-200 shadow-sm shadow-slate-100/50 font-sans"
            placeholder="Search courses by title or description..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-2xl text-xs leading-relaxed max-w-xl">
          {error}
        </div>
      )}

      {/* Grid listing */}
      {filteredCourses.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-200 text-center rounded-2xl bg-white shadow-sm">
          <p className="text-xs text-slate-500">
            No courses found matching "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledIds.includes(course.id)}
              progress={studentProgress[course.id]}
              onEnroll={handleEnroll}
              isEnrolling={enrollLoadingMap[course.id]}
              userRole={user?.role}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
