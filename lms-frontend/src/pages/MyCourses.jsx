import React, { useEffect } from "react";
import { useAuth } from "../store/authStore";
import useCourseStore from "../store/courseStore";
import CourseCard from "../components/CourseCard";
import { Link } from "react-router-dom";

const MyCourses = () => {
  const { user } = useAuth();
  const {
    enrolledCourses: courses,
    studentProgress,
    loading,
    error,
    fetchCoursesAndEnrollment,
  } = useCourseStore();

  // Local UI-only state (not worth a store)
  const [searchTerm, setSearchTerm] = React.useState("");

  useEffect(() => {
    fetchCoursesAndEnrollment(user);
  }, [user]);

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Title Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300/60 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight leading-tight">My Enrolled Courses</h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Access your courses, complete modules, and check your progress
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
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
            className="w-full bg-slate-200 border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-500 focus:outline-none transition-all duration-200 shadow-none font-sans"
            placeholder="Search enrolled courses..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-955/40 border border-rose-900/50 text-rose-300 px-5 py-3.5 rounded-2xl text-xs leading-relaxed max-w-xl">
          {error}
        </div>
      )}

      {/* Grid listing */}
      {filteredCourses.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-300 text-center rounded-2xl bg-slate-200 shadow-none flex flex-col items-center gap-4">
          <p className="text-xs text-slate-550">
            {searchTerm ? `No enrolled courses found matching "${searchTerm}"` : "You are not enrolled in any courses."}
          </p>
          {!searchTerm && (
            <Link
              to="/courses"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              Explore Course Catalog
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={true}
              progress={studentProgress[course.id]}
              userRole={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
