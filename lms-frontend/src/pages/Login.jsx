import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans p-4 relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-slate-50"></div>
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(79,70,229,0.05)] ring-1 ring-slate-100/50 z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white mb-4 transform hover:rotate-6 transition-transform duration-300">
            <svg
              className="w-7 h-7"
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Welcome to LearnSphere
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium font-sans">
            Access your courses, quizzes, and certificates
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-2xl text-xs leading-relaxed animate-shake">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-display">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                  />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/40 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none transition-all duration-200"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1 font-display">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/40 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider rounded-2xl py-3.5 mt-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer font-display"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="flex justify-center mt-6 text-xs text-slate-500 font-sans">
          <span>Don't have an account?</span>
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-bold ml-1.5 transition-colors duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
