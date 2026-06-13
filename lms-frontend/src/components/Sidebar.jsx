import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const getNavLinkClass = ({ isActive }) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200";
    return isActive
      ? `${baseClass} bg-indigo-600 text-white shadow-md shadow-indigo-600/10`
      : `${baseClass} text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40`;
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
      {/* Upper Logo / Links Section */}
      <div className="flex flex-col gap-8 px-6 py-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white">
            <svg
              className="w-6 h-6"
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
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              LMS Platform
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              Microservices Edition
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          <NavLink to="/dashboard" className={getNavLinkClass}>
            <svg
              className="w-5 h-5"
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
              className="w-5 h-5"
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
            Browse Courses
          </NavLink>

          {/* Student specific route */}
          {user?.role === "STUDENT" && (
            <NavLink to="/my-courses" className={getNavLinkClass}>
              <svg
                className="w-5 h-5"
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
              className="w-5 h-5"
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
      <div className="p-4 mx-4 mb-6 bg-slate-800/40 border border-slate-800 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Current Status
          </span>
        </div>
        <p className="text-xs text-slate-300 font-medium">
          Logged in as:
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-semibold text-slate-100 truncate w-32">
            {user?.name}
          </span>
          <span className="text-[9px] uppercase px-2 py-0.5 rounded font-extrabold text-slate-900 bg-indigo-400">
            {user?.role}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
