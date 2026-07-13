import React from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, isEnrolled, progress, onEnroll, isEnrolling, userRole, onDelete }) => {
  // Truncate course description for cleaner grids
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "No description available.";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getCategory = () => {
    const title = (course.title || "").toLowerCase();
    if (title.includes("react") || title.includes("frontend") || title.includes("next")) return "Frontend Development";
    if (title.includes("spring") || title.includes("backend") || title.includes("java") || title.includes("sql")) return "Backend Engineering";
    if (title.includes("full") || title.includes("web") || title.includes("js")) return "Full-Stack Web";
    return "Technology Mastery";
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col justify-between h-full group modern-hover-card">
      {/* Course Banner Overlay */}
      <div className="h-36 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 flex flex-col justify-between border-b border-slate-100 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-all duration-300"></div>

        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white border border-slate-200 text-indigo-600 rounded-full w-fit shadow-sm">
            {getCategory()}
          </span>
          {userRole === "ADMIN" && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(course.id, course.title);
              }}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 rounded-lg transition-colors duration-150 cursor-pointer border border-rose-150"
              title="Delete Course"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        <h3 className="text-base font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors duration-200 z-10">
          {course.title}
        </h3>
      </div>

      {/* Description & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          {truncateText(course.description)}
        </p>

        {/* Modules Count & Badges */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            {course.modules ? course.modules.length : 0} Modules
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span>•</span>
            <span>Self-paced</span>
          </span>
          {isEnrolled && (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Enrolled
            </span>
          )}
        </div>

        {/* Progress Bar (Visible only to students enrolled in the course) */}
        {isEnrolled && progress !== undefined && (
          <div className="flex flex-col gap-1.5 mt-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 shadow-sm shadow-slate-50">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-450 font-medium">Your Progress</span>
              <span className="font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Card Actions */}
        <div className="flex gap-2.5 mt-2">
          {userRole === "STUDENT" && !isEnrolled ? (
            <button
              onClick={() => onEnroll(course.id)}
              disabled={isEnrolling}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 border border-transparent rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/15"
            >
              {isEnrolling ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
              )}
            </button>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="flex-grow text-center py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 shadow-sm"
            >
              {isEnrolled || userRole !== "STUDENT" ? "Enter Course" : "View Details"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
