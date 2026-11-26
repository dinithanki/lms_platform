import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import useCourseStore from "../store/courseStore";
import { useDialogStore } from "../store/dialogStore";

const CourseManagement = () => {
  const { user } = useAuth();
  const { courses, loading, error, fetchCoursesAndEnrollment, deleteCourse } = useCourseStore();
  const [search, setSearch] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  useEffect(() => { fetchCoursesAndEnrollment(user); }, [fetchCoursesAndEnrollment, user]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) => `${course.title || ""} ${course.description || ""} ${course.id}`.toLowerCase().includes(term));
  }, [courses, search]);

  const handleDelete = async (course) => {
    const confirmed = await useDialogStore.getState().showConfirm(
      `Delete “${course.title}” from the course catalog? This action cannot be undone.`,
      "Delete course",
      { confirmLabel: "Delete course" },
    );
    if (!confirmed) return;
    setDeletingCourseId(course.id);
    try {
      await deleteCourse(course.id);
    } catch (deleteError) {
      window.alert(deleteError.response?.data?.message || "Could not delete this course.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--app-primary)]">Administration</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--app-heading)]">Course management</h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">Review course records, open course details, or remove a course from the catalog.</p>
      </div>
      <div className="text-sm text-[var(--app-muted)]" aria-live="polite">{loading ? "Loading courses…" : error ? "Courses unavailable" : `${filteredCourses.length} of ${courses.length} courses`}</div>
    </header>

    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm sm:p-5" aria-label="Search courses">
      <label className="flex max-w-2xl flex-col gap-1.5 text-sm font-medium text-[var(--app-heading)]">
        Search courses
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Course title, description, or ID" className="ui-input" />
      </label>
    </section>

    <section className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm" aria-label="Course list">
      {loading ? <div className="space-y-3 p-5" aria-label="Loading courses">{[1, 2, 3, 4].map((item) => <div key={item} className="ui-skeleton h-16 w-full" />)}</div>
        : error ? <div className="p-10 text-center"><p className="text-sm text-[var(--app-muted)]">{error}</p><button type="button" onClick={() => fetchCoursesAndEnrollment(user)} className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Try again</button></div>
          : filteredCourses.length === 0 ? <div className="p-12 text-center"><h2 className="font-semibold text-[var(--app-heading)]">No courses found</h2><p className="mt-1 text-sm text-[var(--app-muted)]">Try another search term.</p></div>
            : <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--app-surface-muted)] text-xs uppercase tracking-wide text-[var(--app-muted)]">
                    <tr><th scope="col" className="px-5 py-4">Course</th><th scope="col" className="px-5 py-4">Course ID</th><th scope="col" className="px-5 py-4">Modules</th><th scope="col" className="px-5 py-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {filteredCourses.map((course) => <tr key={course.id} className="transition-colors hover:bg-[var(--app-surface-muted)]">
                      <td className="max-w-xl px-5 py-4"><div className="truncate font-semibold text-[var(--app-heading)]">{course.title || "Untitled course"}</div><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-muted)]">{course.description || "No description provided."}</p></td>
                      <td className="px-5 py-4 font-mono text-xs text-[var(--app-muted)]">#{course.id}</td>
                      <td className="px-5 py-4 text-[var(--app-body)]">{course.modules?.length || 0}</td>
                      <td className="px-5 py-4"><div className="flex items-center justify-end gap-2">
                        <Link to={`/courses/${course.id}`} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--app-border)] px-3 text-xs font-semibold text-[var(--app-body)] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-heading)]">View course</Link>
                        <button type="button" onClick={() => handleDelete(course)} disabled={deletingCourseId === course.id} className="inline-flex min-h-9 items-center rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40">{deletingCourseId === course.id ? "Deleting…" : "Delete"}</button>
                      </div></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-[var(--app-border)] md:hidden">
                {filteredCourses.map((course) => <article key={course.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-[var(--app-heading)]">{course.title || "Untitled course"}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-muted)]">{course.description || "No description provided."}</p></div><span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{course.modules?.length || 0} modules</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="font-mono text-[11px] text-[var(--app-muted)]">Course #{course.id}</span><div className="flex gap-2"><Link to={`/courses/${course.id}`} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--app-border)] px-3 text-xs font-semibold text-[var(--app-body)]">View</Link><button type="button" onClick={() => handleDelete(course)} disabled={deletingCourseId === course.id} className="inline-flex min-h-9 items-center rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 disabled:opacity-50 dark:border-red-900 dark:text-red-300">{deletingCourseId === course.id ? "Deleting…" : "Delete"}</button></div></div>
                </article>)}
              </div>
            </>}
    </section>
  </div>;
};

export default CourseManagement;
