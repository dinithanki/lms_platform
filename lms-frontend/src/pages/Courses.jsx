import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import courseService from "../services/courseService";
import enrollmentService from "../services/enrollmentService";
import CourseCard from "../components/CourseCard";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [studentProgress, setStudentProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollLoadingMap, setEnrollLoadingMap] = useState({});

  useEffect(() => {
    fetchCoursesAndEnrollment();
  }, [user]);

  const fetchCoursesAndEnrollment = async () => {
    setLoading(true);
    setError("");
    try {
      const allCourses = await courseService.getAllCourses();
      setCourses(allCourses);

      if (user && user.role === "STUDENT") {
        const enrolled = await enrollmentService.getEnrolledCourses(user.id);
        setEnrolledCourses(enrolled);

        // Fetch progress details for all enrolled courses
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
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError("Unable to load course catalog. Please ensure services are active.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollLoadingMap((prev) => ({ ...prev, [courseId]: true }));
    try {
      await enrollmentService.enrollStudent(courseId, user.id);
      // Refresh details
      await fetchCoursesAndEnrollment();
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert(err.response?.data?.message || "Failed to enroll in the course.");
    } finally {
      setEnrollLoadingMap((prev) => ({ ...prev, [courseId]: false }));
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
          <p className="text-sm text-slate-400 font-medium">Loading course catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Title Header and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Course Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse through all learning courses available in the LMS microservices platform
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
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors duration-200"
            placeholder="Search courses by title or description..."
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-3.5 rounded-2xl text-xs leading-relaxed max-w-xl">
          {error}
        </div>
      )}

      {/* Grid listing */}
      {filteredCourses.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-800 text-center rounded-2xl bg-slate-900/10">
          <p className="text-xs text-slate-400">
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
