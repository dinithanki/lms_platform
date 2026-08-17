import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="app-shell flex items-center justify-center min-h-screen bg-transparent font-sans p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-600/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="surface-card text-center rounded-2xl p-8 max-w-sm shadow-2xl z-10">
        <h1 className="text-5xl font-bold gradient-text tracking-tight font-display">
          404
        </h1>
        <h2 className="text-base font-bold text-white mt-4 uppercase tracking-wider font-display">
          Page Not Found
        </h2>
        <p className="text-sm text-navy-400 mt-2 leading-relaxed">
          The link you requested does not exist or has been relocated to another
          workspace path.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-6 px-5 py-2.5 bg-gradient-to-r from-accent-600 to-cyan-500 hover:from-accent-500 hover:to-cyan-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent-600/15 transition-colors duration-150 cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
