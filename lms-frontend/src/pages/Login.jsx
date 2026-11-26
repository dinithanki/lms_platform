import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";
import AuthShowcase from "../components/AuthShowcase";
import BrandLogo from "../components/BrandLogo";

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
          "Authentication failed. Please verify your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen bg-transparent font-sans">
      {/* LEFT COLUMN: The login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(46,126,247,0.08),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(20,184,214,0.05),transparent_32%)]" />

        <div className="relative z-10 w-full max-w-md surface-card rounded-[2rem] p-6 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="icon-surface h-12 w-12 text-[var(--app-primary)] mb-4 transform hover:rotate-6 transition-transform duration-300">
              <BrandLogo className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-display text-center">
              Sign In
            </h1>
            <p className="text-sm text-navy-300 mt-2 text-center">
              Access your learning workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  className="w-full bg-navy-800 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:bg-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200"
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
                  className="w-full bg-navy-800 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:bg-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex justify-center mt-6 text-sm text-navy-400">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="text-accent-400 hover:text-accent-300 font-semibold ml-1.5 transition-colors duration-200"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The decorative illustration / image */}
      <AuthShowcase
        eyebrow="Accelerate your learning"
        title="A cleaner workspace for courses, quizzes, and certificates."
        copy="Join a focused LMS built for fast access, clear navigation, and a professional learning experience."
        variant="login"
      />
    </div>
  );
};

export default Login;
