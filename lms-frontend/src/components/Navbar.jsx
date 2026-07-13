import React, { useState } from "react";
import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications to satisfy the "Notification Service" visually
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to LMS Platform!",
      message: "Start browsing courses from your dashboard.",
      time: "Just now",
      unread: true,
    },
    {
      id: 2,
      title: "New Quiz Available",
      message: "A new quiz has been published in 'Introduction to Spring Boot'.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Enrollment Confirmed",
      message: "You have successfully enrolled in 'Full Stack Development'.",
      time: "1 day ago",
      unread: false,
    },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const markAllRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, unread: false }))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 glass-header border-b border-slate-200/50">
      {/* Title */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 hidden md:block">
          Welcome back, <span className="text-indigo-600 font-extrabold">{user?.name}</span> 👋
        </h2>
        <h2 className="text-xs font-bold text-slate-800 md:hidden uppercase tracking-wider">
          LearnSphere
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all duration-200"
            aria-label="Notifications"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden z-20 transition-all duration-200 transform origin-top-right">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-150">
                  <span className="font-semibold text-sm text-slate-800">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 transition-colors duration-200 ${
                          notif.unread ? "bg-indigo-50/50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              notif.unread ? "text-indigo-600" : "text-slate-700"
                            }`}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-450 whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-slate-200"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-slate-700">
              {user?.name}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {user?.role}
            </span>
          </div>

          {/* User profile initial or picture */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md cursor-pointer border border-indigo-400/20 hover:scale-105 transition-transform duration-200"
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
