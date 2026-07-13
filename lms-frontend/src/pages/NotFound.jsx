import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-55 font-sans p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="text-center bg-white border border-slate-205 rounded-3xl p-8 max-w-sm shadow-xl shadow-slate-200/40 z-10">
        <h1 className="text-5xl font-extrabold text-indigo-600 tracking-tight">404</h1>
        <h2 className="text-base font-bold text-slate-800 mt-4 uppercase tracking-wider">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The link you requested does not exist or has been relocated to another workspace path.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-colors duration-150 cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
