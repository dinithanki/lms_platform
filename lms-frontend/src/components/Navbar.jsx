import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";
import NavbarStudyTimer from "./NavbarStudyTimer";
import { DEFAULT_AVATAR_URL } from "../constants/profile";
import { API_BASE_URL } from "../services/apiBaseUrl";

const Icon = ({ name, className = "h-5 w-5" }) => {
  const shapes = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
};

const Navbar = ({ onMenuToggle, onSidebarToggle, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("lms-theme") === "dark");
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const imageUrl = user?.profileImageUrl
    ? user.profileImageUrl.startsWith("http") ? user.profileImageUrl : `${API_BASE_URL}${user.profileImageUrl.startsWith("/") ? "" : "/"}${user.profileImageUrl}`
    : null;
  const destinations = useMemo(() => [
    { label: "Dashboard", path: "/dashboard" }, { label: "Course catalog", path: "/courses" },
    ...(user?.role === "STUDENT" ? [{ label: "My learning", path: "/my-courses" }] : []),
    ...(user?.role === "ADMIN" ? [{ label: "User management", path: "/admin/users" }] : []),
    ...(user?.role === "ADMIN" ? [{ label: "Course management", path: "/admin/courses" }] : []),
    { label: "My profile", path: "/profile" },
  ].filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())), [query, user?.role]);

  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); localStorage.setItem("lms-theme", isDark ? "dark" : "light"); }, [isDark]);
  useEffect(() => {
    const closeMenus = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    const handleEscape = (event) => { if (event.key === "Escape") { setProfileOpen(false); setSearchOpen(false); } };
    document.addEventListener("pointerdown", closeMenus); document.addEventListener("keydown", handleEscape);
    return () => { document.removeEventListener("pointerdown", closeMenus); document.removeEventListener("keydown", handleEscape); };
  }, []);

  const handleLogout = async () => { setProfileOpen(false); await logout(); navigate("/login"); };
  const pageName = destinations.find((item) => item.path === location.pathname)?.label || "Learning";

  return <header className="glass-header sticky top-0 z-30 flex h-[72px] items-center justify-between gap-1.5 px-4 md:gap-3 md:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onMenuToggle} className="icon-surface h-11 w-11 text-[var(--app-body)] hover:text-[var(--app-primary)] md:hidden" aria-label="Open navigation"><Icon name="menu"/></button>
      <button type="button" onClick={onSidebarToggle} className="icon-surface hidden h-11 w-11 text-[var(--app-body)] hover:text-[var(--app-primary)] md:inline-flex" aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}><Icon name="menu" className="h-[18px] w-[18px]"/></button>
      <div className="hidden min-w-0 md:block"><div className="truncate text-sm font-semibold text-[var(--app-heading)]">{pageName}</div><div className="text-xs text-[var(--app-muted)]">Welcome back, {user?.name?.split(" ")[0] || "Learner"}</div></div>
    </div>

    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]"/>
          <input aria-label="Search navigation" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="Search" className="h-11 w-[84px] rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-9 pr-2 text-sm text-[var(--app-heading)] placeholder:text-[var(--app-muted)] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-32 lg:w-[200px]"/>
        </div>
        {searchOpen && query.trim() && <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-xl">
          {destinations.length ? destinations.map((item) => <button key={item.path} type="button" onClick={() => { navigate(item.path); setSearchOpen(false); setQuery(""); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-body)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)]">{item.label}</button>) : <div className="px-3 py-2.5 text-sm text-[var(--app-muted)]">No matching pages</div>}
        </div>}
      </div>

      <NavbarStudyTimer />

      <button type="button" onClick={() => setIsDark((value) => !value)} className="icon-surface h-11 w-11 text-[var(--app-body)] hover:bg-[var(--app-surface-muted)]" aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} title={isDark ? "Switch to light theme" : "Switch to dark theme"}><Icon name={isDark ? "sun" : "moon"} className="h-[18px] w-[18px]"/></button>

      <div className="relative" ref={profileRef}>
        <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex h-11 min-w-11 items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-1.5 hover:border-[var(--app-border)] hover:bg-[var(--app-surface-muted)]" aria-label="Open user menu" aria-expanded={profileOpen}>
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-50">
            <img src={imageUrl || DEFAULT_AVATAR_URL} alt={`${user?.name || "User"} profile`} className="h-full w-full object-cover" onError={(event) => { if (!event.currentTarget.src.endsWith(DEFAULT_AVATAR_URL)) event.currentTarget.src = DEFAULT_AVATAR_URL; }}/>
          </span>
          <span className="hidden max-w-28 text-left md:block"><span className="block truncate text-xs font-semibold text-[var(--app-heading)]">{user?.name || "Account"}</span><span className="block text-[11px] text-[var(--app-muted)]">{user?.role || "Member"}</span></span>
          <Icon name="chevron" className="hidden h-4 w-4 text-[var(--app-muted)] md:block"/>
        </button>
        {profileOpen && <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-xl">
          <button type="button" onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--app-body)] hover:bg-[var(--app-surface-muted)]">View profile</button>
          <div className="my-1 border-t border-[var(--app-border)]"/>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"><Icon name="logout" className="h-4 w-4"/>Sign out</button>
        </div>}
      </div>
    </div>
  </header>;
};

export default Navbar;
