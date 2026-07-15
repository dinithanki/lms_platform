import React from "react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const profileImgUrl = user?.profileImageUrl
    ? (user.profileImageUrl.startsWith("http")
      ? user.profileImageUrl
      : `http://localhost:8080${user.profileImageUrl}`)
    : null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 glass-header">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 text-navy-400 hover:text-accent-400 hover:bg-navy-700/50 rounded-lg md:hidden transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <div>
          <h2 className="text-sm font-medium text-navy-100 hidden md:block">
            Welcome back, <span className="font-bold gradient-text">{user?.name}</span> 👋
          </h2>
          <h2 className="text-xs font-bold tracking-widest text-accent-400 md:hidden uppercase font-display">
            LearnSphere
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[13px] font-semibold text-navy-100">
              {user?.name}
            </span>
            <span className="text-[10px] uppercase font-semibold text-navy-400 tracking-wider">
              {user?.role}
            </span>
          </div>

          {/* User profile initial or picture */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-accent-600/20 cursor-pointer border border-accent-400/20 hover:scale-105 transition-transform duration-200 overflow-hidden"
          >
            {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt={user?.name || "User Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 text-navy-400 hover:text-danger-400 hover:bg-navy-700/50 rounded-lg transition-all duration-200 cursor-pointer"
            title="Log Out"
          >
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
