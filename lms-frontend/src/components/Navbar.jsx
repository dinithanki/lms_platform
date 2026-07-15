import React from "react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 glass-header border-b border-slate-200/50 font-display">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg md:hidden transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <div>
          <h2 className="text-sm font-semibold text-slate-800 hidden md:block">
            Welcome back, <span className="text-indigo-600 font-extrabold">{user?.name}</span> 👋
          </h2>
          <h2 className="text-xs font-black tracking-widest text-indigo-600 md:hidden uppercase">
            LearnSphere
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-slate-700 font-display">
              {user?.name}
            </span>
            <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider font-display">
              {user?.role}
            </span>
          </div>

          {/* User profile initial or picture */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black text-xs shadow-md cursor-pointer border border-indigo-400/20 hover:scale-105 transition-transform duration-200 font-display"
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-all duration-200"
            title="Log Out"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
