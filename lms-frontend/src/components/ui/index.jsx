import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";

export function Button({ variant = "primary", size = "md", className = "", type = "button", children, ...props }) {
  const variants = {
    primary: "border border-transparent bg-[var(--app-primary)] text-white hover:bg-[var(--app-primary-hover)]",
    secondary: "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-heading)] hover:bg-[var(--app-surface-muted)]",
    ghost: "border border-transparent bg-transparent text-[var(--app-body)] hover:bg-[var(--app-surface-muted)]",
    danger: "border border-transparent bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = { sm: "min-h-8 px-3 text-xs", md: "min-h-10 px-4 text-sm", lg: "min-h-11 px-5 text-sm" };
  return <button type={type} className={`ui-button ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

export function Input({ label, id, hint, error, className = "", ...props }) {
  const inputId = id || props.name;
  return <div className="flex flex-col gap-1.5">
    {label && <label htmlFor={inputId} className="text-sm font-medium text-[var(--app-heading)]">{label}</label>}
    <input id={inputId} className={`ui-input ${error ? "border-red-500" : ""} ${className}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined} {...props}/>
    {error && <span id={`${inputId}-error`} className="text-xs text-red-600">{error}</span>}
    {!error && hint && <span id={`${inputId}-hint`} className="text-xs text-[var(--app-muted)]">{hint}</span>}
  </div>;
}

export function Card({ as: Component = "section", className = "", children, ...props }) {
  return <Component className={`rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm ${className}`} {...props}>{children}</Component>;
}

export function Badge({ tone = "neutral", className = "", children }) {
  const tones = { neutral: "bg-slate-100 text-slate-700", primary: "bg-blue-50 text-blue-700", success: "bg-green-50 text-green-700", warning: "bg-amber-50 text-amber-800", danger: "bg-red-50 text-red-700" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral} ${className}`}>{children}</span>;
}

export function Dropdown({ trigger, children, align = "right", className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [open, setOpen]);
  return <div className="relative" ref={rootRef}>
    {isValidElement(trigger) ? cloneElement(trigger, { "aria-expanded": open, onClick: (event) => { trigger.props.onClick?.(event); setOpen((value) => !value); } }) : trigger}
    {open && <div role="menu" className={`absolute top-[calc(100%+8px)] z-50 min-w-48 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-1.5 shadow-xl ${align === "left" ? "left-0" : "right-0"} ${className}`}>{children}</div>}
  </div>;
}

export function Dialog({ open, title, description, onClose, children, footer, className = "" }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    panelRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previous?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div className="absolute inset-0 bg-slate-950/45" aria-hidden="true"/>
    <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title" aria-describedby={description ? "ui-dialog-description" : undefined} className={`relative z-10 w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl ${className}`}>
      <h2 id="ui-dialog-title" className="text-lg font-semibold text-[var(--app-heading)]">{title}</h2>
      {description && <p id="ui-dialog-description" className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{description}</p>}
      <div className="mt-5">{children}</div>
      {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
    </section>
  </div>;
}

export function Skeleton({ className = "h-4 w-full", ...props }) {
  return <div aria-hidden="true" className={`ui-skeleton ${className}`} {...props}/>;
}

