import { NavLink } from "react-router-dom";
import { useAuth } from "../store/authStore";

const Icon = ({ name, className = "h-5 w-5" }) => {
  const paths = {
    home: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
  const { user } = useAuth();
  const links = [
    { to: "/dashboard", label: "Overview", icon: "home" },
    { to: "/courses", label: "Course catalog", icon: "book" },
    ...(user?.role === "STUDENT" ? [{ to: "/my-courses", label: "My learning", icon: "book" }] : []),
    { to: "/profile", label: "My profile", icon: "profile" },
  ];

  return <>
    {isOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={onClose}/>}
    <aside aria-label="Main navigation" className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] transition-[transform,width] duration-200 md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "md:w-[84px]" : "md:w-[256px]"}`}>
      <div className={`flex h-[72px] items-center gap-3 border-b border-[var(--app-border)] px-5 ${isCollapsed ? "md:justify-center md:px-3" : ""}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)] text-sm font-bold text-white shadow-sm">L</div>
        <div className={isCollapsed ? "md:hidden" : ""}>
          <div className="text-[15px] font-bold tracking-tight text-[var(--app-heading)]">LearnSphere</div>
          <div className="text-xs text-[var(--app-muted)]">Learning platform</div>
        </div>
        <button type="button" className="ml-auto rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-surface-muted)] md:hidden" onClick={onClose} aria-label="Close menu"><Icon name="menu" className="h-4 w-4"/></button>
      </div>

      <div className={`px-4 pt-7 ${isCollapsed ? "md:px-3" : ""}`}>
        <div className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--app-muted)] ${isCollapsed ? "md:hidden" : ""}`}>Workspace</div>
        <nav className="flex flex-col gap-1" onClick={onClose}>
          {links.map(({ to, label, icon }) => <NavLink key={to} to={to} title={isCollapsed ? label : undefined} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? "bg-[var(--app-primary-light)] text-[var(--app-primary)]" : "text-[var(--app-body)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)]"} ${isCollapsed ? "md:justify-center md:px-0" : ""}`}>
            <Icon name={icon} className="h-[18px] w-[18px] shrink-0"/><span className={isCollapsed ? "md:hidden" : ""}>{label}</span>
          </NavLink>)}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className={`rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-3 ${isCollapsed ? "md:hidden" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">{user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}</div>
            <div className="min-w-0"><div className="truncate text-sm font-semibold text-[var(--app-heading)]">{user?.name || "Learner"}</div><div className="truncate text-xs text-[var(--app-muted)]">{user?.role || "Member"}</div></div>
          </div>
        </div>
      </div>
    </aside>
  </>;
};

export default Sidebar;
