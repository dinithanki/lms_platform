import BrandLogo from "./BrandLogo";

const statsForVariant = {
  login: [
    { value: "24/7", label: "Access" },
    { value: "120+", label: "Lessons" },
  ],
  register: [
    { value: "Student", label: "Default role" },
    { value: "Fast", label: "Setup" },
  ],
};

const AuthShowcase = ({ eyebrow, title, copy, variant = "login" }) => {
  const stats = statsForVariant[variant] || statsForVariant.login;

  return (
    <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 xl:p-16 relative overflow-hidden surface-card-strong">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_left,rgba(46,126,247,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,214,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_35%,rgba(255,255,255,0.02)_65%,transparent_88%)] opacity-40" />
      <div className="absolute -right-24 top-16 h-64 w-64 rounded-full bg-accent-500/12 blur-3xl" />
      <div className="absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-cyan-500/8 blur-3xl" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="icon-surface h-11 w-11 text-[var(--app-primary)]">
          <BrandLogo className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-navy-400">
            LearnSphere
          </p>
          <p className="text-sm text-navy-300">
            Professional learning operations
          </p>
        </div>
      </div>

      <div className="relative z-10 my-auto max-w-xl">
        <span className="section-chip">{eyebrow}</span>
        <h2 className="mt-5 max-w-lg text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white font-display">
          {title}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-navy-300">
          {copy}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 max-w-md">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="surface-card rounded-2xl px-4 py-3"
            >
              <div className="text-lg font-bold text-white font-display">
                {stat.value}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-navy-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-lg">
        <div className="surface-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="icon-surface h-10 w-10 text-accent-300 shrink-0">
                <svg
                  className="h-4.5 w-4.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  Structured course workspace
                </div>
                <div className="text-xs text-navy-400">
                  Clean, focused, and ready for daily learning.
                </div>
              </div>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-success-600/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-success-400 border border-success-600/20">
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;
