import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../store/authStore";
import useDashboardStore from "../store/dashboardStore";
import { useDialogStore } from "../store/dialogStore";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, usersLoading, usersError, roleUpdateLoading, userDeleteLoading, fetchUsers, updateUserRole, deleteUser } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((account) => {
      const matchesRole = roleFilter === "ALL" || account.role === roleFilter;
      const matchesSearch = !normalizedSearch || `${account.name || ""} ${account.email || ""} ${account.id}`.toLowerCase().includes(normalizedSearch);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (account, role) => {
    if (role === account.role) return;
    try {
      await updateUserRole(account.id, role);
    } catch (error) {
      window.alert(error.response?.data?.message || "Could not update this user's role.");
    }
  };

  const handleDelete = async (account) => {
    const confirmed = await useDialogStore.getState().showConfirm(
      `Delete ${account.name || account.email}? Their profile and access will be removed.`,
      "Delete user",
      { confirmLabel: "Delete user" },
    );
    if (!confirmed) return;
    try {
      await deleteUser(account.id);
    } catch (error) {
      window.alert(error.response?.data?.message || "Could not delete this user.");
    }
  };

  const roleClass = (role) => role === "ADMIN"
    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
    : role === "INSTRUCTOR"
      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
      : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--app-primary)]">Administration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--app-heading)]">User management</h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">Review registered accounts and manage their access roles.</p>
      </div>
      <div className="text-sm text-[var(--app-muted)]" aria-live="polite">
        {usersLoading ? "Loading accounts…" : usersError ? "Account list unavailable" : `${visibleUsers.length} of ${users.length} accounts`}
      </div>
    </header>

    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5" aria-label="Filter users">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--app-heading)]">
          Search accounts
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or ID" className="ui-input"/>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--app-heading)]">
          Role
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="ui-input">
            <option value="ALL">All roles</option>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm" aria-label="Registered users">
      {usersLoading ? <div className="space-y-3 p-5" aria-label="Loading users">{[1, 2, 3, 4].map((item) => <div key={item} className="ui-skeleton h-12 w-full" />)}</div>
        : usersError ? <div className="p-10 text-center"><p className="text-sm text-[var(--app-muted)]">{usersError}</p><button type="button" onClick={fetchUsers} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Try again</button></div>
          : visibleUsers.length === 0 ? <div className="p-10 text-center"><p className="font-medium text-[var(--app-heading)]">No users found</p><p className="mt-1 text-sm text-[var(--app-muted)]">Try another search or role filter.</p></div>
            : <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--app-surface-muted)] text-xs uppercase tracking-wide text-[var(--app-muted)]">
                    <tr><th scope="col" className="px-5 py-4">User</th><th scope="col" className="px-5 py-4">Account ID</th><th scope="col" className="px-5 py-4">Role</th><th scope="col" className="px-5 py-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {visibleUsers.map((account) => {
                      const isSelf = account.email === currentUser?.email;
                      return <tr key={account.id} className="transition-colors hover:bg-[var(--app-surface-muted)]">
                        <td className="px-5 py-4"><div className="font-semibold text-[var(--app-heading)]">{account.name || "Unnamed user"}</div><div className="mt-0.5 text-xs text-[var(--app-muted)]">{account.email}</div></td>
                        <td className="px-5 py-4 font-mono text-xs text-[var(--app-muted)]">#{account.id}</td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleClass(account.role)}`}>{account.role}</span></td>
                        <td className="px-5 py-4"><div className="flex items-center justify-end gap-2">
                          <label className="sr-only" htmlFor={`role-${account.id}`}>Role for {account.name || account.email}</label>
                          <select id={`role-${account.id}`} value={account.role} onChange={(event) => handleRoleChange(account, event.target.value)} disabled={isSelf || roleUpdateLoading === account.id || userDeleteLoading === account.id} className="ui-input min-h-9 w-40 py-1.5 text-xs disabled:opacity-60">
                            <option value="STUDENT">Student</option><option value="INSTRUCTOR">Instructor</option><option value="ADMIN">Admin</option>
                          </select>
                          <button type="button" onClick={() => handleDelete(account)} disabled={isSelf || userDeleteLoading === account.id || roleUpdateLoading === account.id} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40" title={isSelf ? "You cannot delete your own account" : `Delete ${account.name || account.email}`}>{userDeleteLoading === account.id ? "Deleting…" : "Delete"}</button>
                        </div></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col divide-y divide-[var(--app-border)] md:hidden">
                {visibleUsers.map((account) => {
                  const isSelf = account.email === currentUser?.email;
                  return <article key={account.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-[var(--app-heading)]">{account.name || "Unnamed user"}</h2><p className="truncate text-xs text-[var(--app-muted)]">{account.email}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${roleClass(account.role)}`}>{account.role}</span></div>
                    <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`mobile-role-${account.id}`}>Role for {account.name || account.email}</label><select id={`mobile-role-${account.id}`} value={account.role} onChange={(event) => handleRoleChange(account, event.target.value)} disabled={isSelf || roleUpdateLoading === account.id || userDeleteLoading === account.id} className="ui-input min-h-9 flex-1 py-1.5 text-xs"><option value="STUDENT">Student</option><option value="INSTRUCTOR">Instructor</option><option value="ADMIN">Admin</option></select><button type="button" onClick={() => handleDelete(account)} disabled={isSelf || userDeleteLoading === account.id || roleUpdateLoading === account.id} className="min-h-9 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40">{userDeleteLoading === account.id ? "Deleting…" : "Delete"}</button></div>
                    <p className="text-[11px] text-[var(--app-muted)]">Account ID: #{account.id}{isSelf ? " · Your account" : ""}</p>
                  </article>;
                })}
              </div>
            </>}
    </section>
  </div>;
};

export default UserManagement;
