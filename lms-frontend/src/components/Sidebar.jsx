import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../store/authStore";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavLinkClass = ({ isActive }) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-3 text-[13px] font-semibold rounded-xl transition-all duration-200 border";
    return isActive
      ? `${baseClass} bg-accent-600/10 text-accent-400 border-accent-600/20`
      : `${baseClass} text-navy-300 hover:text-accent-400 hover:bg-navy-700/60 border-transparent`;
  };

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] min-h-screen bg-navy-850 border-r border-navy-700/40 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static md:flex ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Upper Logo / Links Section */}
      <div className="flex flex-col gap-8 px-5 py-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 select-none px-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-500 text-white shadow-lg shadow-accent-600/20 transform hover:rotate-6 transition-transform duration-300">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight leading-tight font-display gradient-text">
              LearnSphere
            </h1>
            <span className="text-[10px] text-navy-400 font-medium tracking-wider uppercase block mt-0.5">
              LMS Platform
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5" onClick={onClose}>
          <NavLink to="/dashboard" className={getNavLinkClass}>
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
              />
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/courses" className={getNavLinkClass}>
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Browse Catalog
          </NavLink>

          {/* Student specific route */}
          {user?.role === "STUDENT" && (
            <NavLink to="/my-courses" className={getNavLinkClass}>
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              My Courses
            </NavLink>
          )}

          <NavLink to="/profile" className={getNavLinkClass}>
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            My Profile
          </NavLink>
        </nav>
      </div>

      {/* Role specific sidebar card */}
      <div className="p-4 mx-4 mb-6 bg-navy-800/50 border border-navy-700/40 rounded-2xl flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-navy-400">
            System Live
          </span>
        </div>
        <p className="text-[11px] text-navy-400 font-medium">
          Logged in as:
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[13px] font-semibold text-navy-100 truncate w-28">
            {user?.name}
          </span>
          <span className="text-[10px] uppercase px-2.5 py-1 rounded-lg font-semibold text-accent-400 bg-accent-600/10 border border-accent-600/20">
            {user?.role}
          </span>
        </div>
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
