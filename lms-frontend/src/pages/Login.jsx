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
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* LEFT COLUMN: The login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorative Mesh for Left side */}
        <div className="absolute top-1/4 left-1/4 w-[25rem] h-[25rem] bg-indigo-500/5 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md bg-slate-100 border border-slate-350 rounded-[2rem] p-6 sm:p-10 shadow-2xl z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-650 shadow-lg shadow-indigo-500/20 text-white mb-4 transform hover:rotate-6 transition-transform duration-300">
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
            <h1 className="text-2xl font-black text-slate-800 tracking-tight font-display text-center">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-medium font-sans text-center">
              Access your courses, quizzes, and certificates
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 px-4 py-3 rounded-2xl text-xs leading-relaxed animate-shake">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5 text-rose-455"
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
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1 font-display">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
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
                  className="w-full bg-slate-200/50 border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-500 focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1 font-display">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
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
                  className="w-full bg-slate-200/50 border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-500 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl py-3.5 mt-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer font-display"
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
              className="text-indigo-400 hover:text-indigo-300 font-bold ml-1.5 transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The decorative illustration / image */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-16 relative overflow-hidden">
        {/* Background Image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/90 via-slate-950/85 to-transparent"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-650 shadow-md text-white">
            <svg
              className="w-5.5 h-5.5"
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
          <span className="text-lg font-black text-white tracking-tight font-display">
            LearnSphere
          </span>
        </div>

        {/* Motivational Message */}
        <div className="relative z-10 my-auto max-w-lg">
          <span className="text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-display">
            Accelerate your learning
          </span>
          <h2 className="text-4xl font-black text-white leading-tight font-display mt-4">
            Master demand-driven technical skills today.
          </h2>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-md">
            Join the premium microservices training platform. Resourced syllabus, automated quiz scoring, and downloadable course certificates.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>© 2026 LearnSphere Inc.</span>
          <span>Core Microservices LMS</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
