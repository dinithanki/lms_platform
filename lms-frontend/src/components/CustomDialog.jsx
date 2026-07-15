import React, { useEffect } from "react";
import { useDialogStore } from "../store/dialogStore";

export default function CustomDialog() {
  const {
    isOpen,
    type,
    title,
    message,
    confirmLabel,
    cancelLabel,
    confirm,
    cancel,
  } = useDialogStore();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        cancel();
      } else if (e.key === "Enter") {
        confirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, confirm, cancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={type === "confirm" ? cancel : confirm}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl border border-navy-700/50 bg-navy-850/95 text-navy-100 transform transition-all animate-scaleIn overflow-hidden">
        {/* Top gradient highlight strip based on action type */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            type === "confirm"
              ? "bg-gradient-to-r from-accent-500 to-cyan-500"
              : "bg-gradient-to-r from-warn-500 to-danger-500"
          }`}
        />

        {/* Header containing icon and text */}
        <div className="flex items-start gap-4 mt-2">
          {/* Custom SVG Icons */}
          <div
            className={`flex-shrink-0 p-3 rounded-xl ${
              type === "confirm"
                ? "bg-accent-500/10 text-accent-400 border border-accent-500/20"
                : "bg-warn-500/10 text-warn-400 border border-warn-500/20"
            }`}
          >
            {type === "confirm" ? (
              // Help / Question Icon
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              // Warning Icon
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white tracking-wide leading-6">
              {title}
            </h3>
            <p className="mt-2 text-sm text-navy-300 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {type === "confirm" && (
            <button
              onClick={cancel}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-navy-300 hover:text-white bg-navy-800 hover:bg-navy-700/80 border border-navy-700/50 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={confirm}
            className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white rounded-xl shadow-lg transition-all duration-200 cursor-pointer ${
              type === "confirm"
                ? "bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 active:scale-95 shadow-accent-500/10 hover:shadow-accent-500/20"
                : "bg-gradient-to-r from-warn-600 to-warn-500 hover:from-warn-500 hover:to-warn-400 active:scale-95 shadow-warn-500/10 hover:shadow-warn-500/20"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
