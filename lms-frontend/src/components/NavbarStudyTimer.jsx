import { useEffect, useRef, useState } from "react";

const MODES = [
  { id: "focus", label: "Focus", seconds: 25 * 60 },
  { id: "short", label: "Short break", seconds: 5 * 60 },
  { id: "long", label: "Long break", seconds: 15 * 60 },
  { id: "stopwatch", label: "Stopwatch", seconds: 0 },
];

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  return [hours, minutes, remainingSeconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const Icon = ({ name, className = "h-4 w-4" }) => {
  const shapes = {
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M8 5h3v14H8z" fill="currentColor" stroke="none"/><path d="M15 5h3v14h-3z" fill="currentColor" stroke="none"/></>,
    reset: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{shapes[name]}</svg>;
};

export default function NavbarStudyTimer() {
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [modeId, setModeId] = useState("focus");
  const [remainingSeconds, setRemainingSeconds] = useState(MODES[0].seconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [endsAt, setEndsAt] = useState(null);
  const [stopwatchStartedAt, setStopwatchStartedAt] = useState(null);
  const rootRef = useRef(null);
  const mode = MODES.find((item) => item.id === modeId) || MODES[0];
  const isStopwatch = mode.id === "stopwatch";
  const displayedTime = isStopwatch ? elapsedSeconds : remainingSeconds;
  const currentDate = new Date(now);
  const fullTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(currentDate);
  const compactTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(currentDate);
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(currentDate);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => {
      if (isStopwatch && stopwatchStartedAt != null) {
        setElapsedSeconds(Math.floor((Date.now() - stopwatchStartedAt) / 1000));
        return;
      }
      if (endsAt != null) {
        const nextRemaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setRemainingSeconds(nextRemaining);
        if (nextRemaining === 0) {
          setRunning(false);
          setEndsAt(null);
        }
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, isStopwatch, endsAt, stopwatchStartedAt]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectMode = (nextMode) => {
    setRunning(false);
    setEndsAt(null);
    setStopwatchStartedAt(null);
    setModeId(nextMode.id);
    setRemainingSeconds(nextMode.seconds);
    setElapsedSeconds(0);
  };

  const toggleTimer = () => {
    if (running) {
      setRunning(false);
      if (isStopwatch) setStopwatchStartedAt(null);
      else setEndsAt(null);
      return;
    }
    if (!isStopwatch && remainingSeconds === 0) setRemainingSeconds(mode.seconds);
    if (isStopwatch) setStopwatchStartedAt(Date.now() - elapsedSeconds * 1000);
    else setEndsAt(Date.now() + (remainingSeconds === 0 ? mode.seconds : remainingSeconds) * 1000);
    setRunning(true);
  };

  const resetTimer = () => {
    setRunning(false);
    setEndsAt(null);
    setStopwatchStartedAt(null);
    setRemainingSeconds(mode.seconds);
    setElapsedSeconds(0);
  };

  return <div className="relative shrink-0" ref={rootRef}>
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="dialog" aria-label={`Current time ${fullTime}. Open study timer`} className="flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 text-[var(--app-heading)] transition-colors hover:bg-[var(--app-surface-muted)] sm:gap-2 sm:px-2.5">
      <Icon name="clock" className="hidden h-4 w-4 shrink-0 text-[var(--app-primary)] sm:block"/>
      <span className="text-sm font-semibold tabular-nums lg:hidden">{compactTime}</span>
      <span className="hidden text-xs font-semibold tabular-nums lg:inline lg:text-sm">{fullTime}</span>
      <span className="hidden text-[10px] text-[var(--app-muted)] min-[1024px]:inline">{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(currentDate)}</span>
      <Icon name="chevron" className={`h-3.5 w-3.5 shrink-0 text-[var(--app-muted)] transition-transform ${open ? "rotate-180" : ""}`}/>
    </button>

    {open && <>
      <button type="button" aria-label="Close study timer" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 sm:hidden"/>
      <section role="dialog" aria-label="Clock and study timer" className="fixed inset-x-3 bottom-3 z-50 max-h-[min(690px,calc(100dvh-24px))] overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+10px)] sm:max-h-[min(690px,calc(100dvh-100px))] sm:w-[min(390px,calc(100vw-24px))] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-sm font-semibold text-[var(--app-heading)]">Study timer</h2><p className="mt-0.5 text-xs text-[var(--app-muted)]">{dateLabel}</p></div>
          <div className="text-xs font-medium tabular-nums text-[var(--app-body)]">{fullTime}</div>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-[var(--app-surface-muted)] p-1" role="tablist" aria-label="Timer mode">
          {MODES.map((item) => <button key={item.id} id={`timer-tab-${item.id}`} type="button" role="tab" aria-selected={mode.id === item.id} onClick={() => selectMode(item)} className={`min-h-11 shrink-0 rounded-lg px-3 text-xs font-semibold transition-colors ${mode.id === item.id ? "bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm" : "text-[var(--app-muted)] hover:text-[var(--app-heading)]"}`}>{item.label}</button>)}
        </div>

        <div className="py-6 text-center" role="tabpanel" aria-labelledby={`timer-tab-${mode.id}`}>
          <div className="text-[clamp(2.75rem,13vw,4rem)] font-semibold leading-none tracking-tight tabular-nums text-[var(--app-heading)]">{formatTime(displayedTime)}</div>
          <p className="mt-2 text-xs font-medium text-[var(--app-muted)]">{running ? (isStopwatch ? "Stopwatch running" : `${mode.label} in progress`) : !isStopwatch && remainingSeconds === 0 ? "Session complete" : mode.label}</p>
        </div>

        <div className="grid grid-cols-[1fr_48px] gap-2">
          <button type="button" onClick={toggleTimer} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--app-primary-hover)]">
            <Icon name={running ? "pause" : "play"} className="h-4 w-4"/>{running ? "Pause" : "Start"}
          </button>
          <button type="button" onClick={resetTimer} aria-label="Reset timer" title="Reset timer" className="flex min-h-12 items-center justify-center rounded-xl border border-[var(--app-border)] text-[var(--app-body)] transition-colors hover:bg-[var(--app-surface-muted)]"><Icon name="reset" className="h-4 w-4"/></button>
        </div>
      </section>
    </>}
  </div>;
}
