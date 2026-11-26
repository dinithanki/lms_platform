import { useState } from "react";
import { Link } from "react-router-dom";

const getYouTubeId = (value) => {
  if (!value || typeof value !== "string") return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    let id = null;
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0];
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

const CourseCard = ({
  course,
  isEnrolled,
  progress,
  onEnroll,
  isEnrolling,
  userRole,
  onDelete,
}) => {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const firstLesson = course.modules?.[0];
  const youtubeId = getYouTubeId(firstLesson?.videoUrl);
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
  // Truncate course description for cleaner grids
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "No description available.";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div className="surface-card rounded-2xl overflow-hidden flex flex-col justify-between h-full group modern-hover-card">
      {/* Course Banner Overlay */}
      <div className="relative h-44 overflow-hidden border-b border-[var(--app-border)] bg-gradient-to-br from-blue-950 via-blue-900 to-slate-800 p-5">
        {thumbnailUrl && !thumbnailFailed ? (
          <img
            src={thumbnailUrl}
            alt={`${course.title} video thumbnail`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setThumbnailFailed(true)}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_75%_20%,rgba(96,165,250,0.32),transparent_32%),linear-gradient(135deg,#172554,#1e3a8a_55%,#0f172a)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-bold text-white/90 shadow-lg backdrop-blur-sm">
              {course.title?.trim()?.charAt(0)?.toUpperCase() || "L"}
            </div>
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-slate-950/10" />

        <div className="relative z-10 flex justify-between items-start">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
        <h3 className="course-card-banner-title relative z-10 line-clamp-2 text-[15px] font-bold leading-snug text-white font-display">
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
          {isEnrolled && (
            <span className="text-success-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
              Enrolled
            </span>
          )}
        </div>

        {/* Progress Bar (Visible only to students enrolled in the course) */}
        {userRole === "STUDENT" && isEnrolled && progress != null && (
          <div className="flex flex-col gap-2 mt-1 bg-navy-850 p-3 rounded-xl border border-navy-700/30">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-navy-400 font-medium">Your Progress</span>
              <span className="font-bold text-accent-400">
                {Math.round(progress)}%
              </span>
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
              className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-gradient-to-r from-accent-600 to-cyan-500 hover:from-accent-500 hover:to-cyan-400 active:scale-[0.99] disabled:bg-navy-700 disabled:text-navy-500 border border-transparent rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent-600/15"
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
              className="flex-grow text-center py-2.5 text-[13px] font-semibold text-navy-200 hover:text-accent-300 bg-navy-700/50 hover:bg-navy-700 border border-navy-700/40 rounded-xl transition-all duration-200"
            >
              {isEnrolled || userRole !== "STUDENT"
                ? "Enter Course"
                : "View Details"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
