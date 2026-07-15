import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT"); // Default role
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !role) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-900 font-sans">
      {/* LEFT COLUMN: Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorative Mesh */}
        <div className="absolute top-1/4 right-1/4 w-[25rem] h-[25rem] bg-purple-600/5 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[25rem] h-[25rem] bg-accent-600/5 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-md bg-navy-850 border border-navy-700/40 rounded-[2rem] p-6 sm:p-10 shadow-2xl shadow-black/30 z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-cyan-500 shadow-lg shadow-accent-600/20 text-white mb-4 transform hover:rotate-6 transition-transform duration-300">
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
            <h1 className="text-2xl font-bold text-white tracking-tight font-display text-center">
              Create Account
            </h1>
            <p className="text-sm text-navy-300 mt-2 text-center">
              Get started with our Learning Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-start gap-2.5 bg-danger-700/20 border border-danger-700/40 text-danger-400 px-4 py-3 rounded-xl text-sm leading-relaxed">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-navy-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-navy-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-navy-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                Join Workspace As
              </label>
              <div className="grid grid-cols-2 gap-2 bg-navy-800 p-1.5 rounded-xl border border-navy-700/50">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`py-2.5 text-[12px] truncate px-1 font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                    role === "STUDENT"
                      ? "bg-accent-600 text-white shadow-md"
                      : "text-navy-400 hover:text-navy-200"
                  }`}
                >
                  Student Learner
                </button>
                <button
                  type="button"
                  onClick={() => setRole("INSTRUCTOR")}
                  className={`py-2.5 text-[12px] truncate px-1 font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                    role === "INSTRUCTOR"
                      ? "bg-accent-600 text-white shadow-md"
                      : "text-navy-400 hover:text-navy-200"
                  }`}
                >
                  Instructor Creator
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-600 hover:bg-accent-500 active:scale-[0.98] disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-sm rounded-xl py-3.5 mt-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent-600/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex justify-center mt-5 text-sm text-navy-400">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="text-accent-400 hover:text-accent-300 font-semibold ml-1.5 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The decorative illustration / image */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-navy-950 p-16 relative overflow-hidden">
        {/* Background Image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-navy-950 via-navy-900/95 to-accent-900/30"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-500 shadow-md text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight font-display">
            LearnSphere
          </span>
        </div>

        {/* Motivational Message */}
        <div className="relative z-10 my-auto max-w-lg">
          <span className="text-[11px] uppercase tracking-widest font-semibold px-3 py-1.5 bg-accent-600/15 text-accent-300 border border-accent-600/25 rounded-full">
            Join the Catalog
          </span>
          <h2 className="text-4xl font-bold text-white leading-tight font-display mt-5">
            Build credentials and learn at your own pace.
          </h2>
          <p className="text-navy-300 mt-4 text-[15px] leading-relaxed max-w-md">
            Unlock instant enrollment, browse specialized courses, test your skills, and earn certified credentials that validate your expertise.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 flex items-center justify-between text-sm text-navy-500 font-medium">
          <span>© 2026 LearnSphere Inc.</span>
          <span>Core Microservices LMS</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
