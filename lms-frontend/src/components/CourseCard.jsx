import React from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, isEnrolled, progress, onEnroll, isEnrolling, userRole }) => {
  // Truncate course description for cleaner grids
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "No description available.";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 flex flex-col justify-between h-full group">
      {/* Course Banner Overlay */}
      <div className="h-32 bg-gradient-to-br from-indigo-900/60 to-purple-950/60 p-5 flex flex-col justify-between border-b border-slate-800/60 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300"></div>

        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-slate-950/80 text-indigo-400 border border-indigo-400/20 rounded-full w-fit">
          Course
        </span>
        <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors duration-200">
          {course.title}
        </h3>
      </div>

      {/* Description & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          {truncateText(course.description)}
        </p>

        {/* Modules Count & Badges */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium border-t border-slate-800/40 pt-3">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            {course.modules ? course.modules.length : 0} Modules
          </span>
          {isEnrolled && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Enrolled
            </span>
          )}
        </div>

        {/* Progress Bar (Visible only to students enrolled in the course) */}
        {isEnrolled && progress !== undefined && (
          <div className="flex flex-col gap-1.5 mt-1 bg-slate-800/20 p-2.5 rounded-xl border border-slate-800/40">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 font-medium">Your Progress</span>
              <span className="font-bold text-indigo-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
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
              className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 border border-transparent rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
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
              className="flex-grow text-center py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl transition-all duration-200"
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
