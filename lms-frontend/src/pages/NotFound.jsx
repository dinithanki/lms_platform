import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-navy-900 font-sans p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-600/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="text-center bg-navy-800 border border-navy-700/40 rounded-2xl p-8 max-w-sm shadow-2xl shadow-black/30 z-10">
        <h1 className="text-5xl font-bold text-accent-400 tracking-tight font-display">404</h1>
        <h2 className="text-base font-bold text-white mt-4 uppercase tracking-wider font-display">Page Not Found</h2>
        <p className="text-sm text-navy-400 mt-2 leading-relaxed">
          The link you requested does not exist or has been relocated to another workspace path.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-6 px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-600/15 transition-colors duration-150 cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
