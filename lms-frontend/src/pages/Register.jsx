import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import AuthShowcase from "../components/AuthShowcase";

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
          "Registration failed. Email may already be in use.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen bg-transparent font-sans">
      {/* LEFT COLUMN: Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(46,126,247,0.05),transparent_34%)]" />

        <div className="relative z-10 w-full max-w-md surface-card rounded-[2rem] p-6 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="icon-surface h-12 w-12 text-white mb-4 transform hover:rotate-6 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-accent-300"
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
              Sign Up
            </h1>
            <p className="text-sm text-navy-300 mt-2 text-center">
              Create your learner or instructor profile
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
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
                  Student
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
                  Instructor
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
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The decorative illustration / image */}
      <AuthShowcase
        eyebrow="Join the catalog"
        title="Build credentials with a focused, professional learning layout."
        copy="Create an account, choose a role, and start using a streamlined LMS experience in minutes."
        variant="register"
      />
    </div>
  );
};

export default Register;
