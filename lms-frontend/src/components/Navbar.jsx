import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import notificationService from "../services/notificationService";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        const count = res.data.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({ ...n, read: true, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    const isUnread = !notif.read && !notif.isRead;
    if (isUnread) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(
          notifications.map((n) => (n.id === notif.id ? { ...n, read: true, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  };

  const formatNotificationTime = (createdAtString) => {
    if (!createdAtString) return "Just now";
    try {
      const date = new Date(createdAtString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (e) {
      return "Just now";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 hidden md:block">
          Welcome back, <span className="text-indigo-400">{user?.name}</span>
        </h2>
        <h2 className="text-base font-semibold text-slate-100 md:hidden">
          LMS Portal
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-full transition-all duration-200"
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
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-500 rounded-full animate-pulse">
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
              <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-20 transition-all duration-200 transform origin-top-right">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/40 border-b border-slate-800">
                  <span className="font-semibold text-sm text-slate-200">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.read && !notif.isRead;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 transition-colors duration-200 cursor-pointer ${
                            isUnread ? "bg-indigo-500/5 hover:bg-indigo-500/10" : "hover:bg-slate-800/30"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span
                              className={`text-xs font-semibold ${
                                isUnread ? "text-indigo-300" : "text-slate-300"
                              }`}
                            >
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                              {formatNotificationTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                            {notif.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-slate-800"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-slate-200">
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
            className="flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-full transition-all duration-200"
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
