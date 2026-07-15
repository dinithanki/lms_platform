import React from "react";
import { Link } from "react-router-dom";

const CourseCard = ({ course, isEnrolled, progress, onEnroll, isEnrolling, userRole, onDelete }) => {
  // Truncate course description for cleaner grids
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "No description available.";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="bg-navy-800 border border-navy-700/40 rounded-2xl overflow-hidden flex flex-col justify-between h-full group modern-hover-card">
      {/* Course Banner Overlay */}
      <div className="h-36 bg-gradient-to-br from-navy-700 via-navy-800 to-accent-900/40 p-5 flex flex-col justify-between border-b border-navy-700/40 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/8 rounded-full blur-2xl group-hover:bg-accent-500/15 transition-all duration-500"></div>

        <div className="flex justify-between items-start z-10">
          {userRole === "ADMIN" && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(course.id, course.title);
              }}
              className="p-1.5 bg-danger-700/30 hover:bg-danger-700/50 text-danger-400 rounded-lg transition-colors duration-150 cursor-pointer border border-danger-700/40"
              title="Delete Course"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        <h3 className="text-[15px] font-bold text-navy-50 line-clamp-2 leading-snug group-hover:text-accent-300 transition-colors duration-300 z-10 font-display">
          {course.title}
        </h3>
      </div>

      {/* Description & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <p className="text-[13px] text-navy-300 leading-relaxed">
          {truncateText(course.description)}
        </p>

        {/* Modules Count & Badges */}
        <div className="flex items-center justify-between text-[12px] text-navy-400 font-medium border-t border-navy-700/30 pt-3">
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 text-accent-400"
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
          <span className="flex items-center gap-1.5 text-navy-400">
            <span>•</span>
            <span>Self-paced</span>
          </span>
          {isEnrolled && (
            <span className="text-success-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
              Enrolled
            </span>
          )}
        </div>

        {/* Progress Bar (Visible only to students enrolled in the course) */}
        {isEnrolled && progress !== undefined && (
          <div className="flex flex-col gap-2 mt-1 bg-navy-850 p-3 rounded-xl border border-navy-700/30">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-navy-400 font-medium">Your Progress</span>
              <span className="font-bold text-accent-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
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
              className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-accent-600 hover:bg-accent-500 active:scale-[0.99] disabled:bg-navy-700 disabled:text-navy-500 border border-transparent rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent-600/15"
            >
              {isEnrolling ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
              )}
            </button>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="flex-grow text-center py-2.5 text-[13px] font-semibold text-navy-200 hover:text-accent-400 bg-navy-700/50 hover:bg-navy-700 border border-navy-700/40 rounded-xl transition-all duration-200"
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
