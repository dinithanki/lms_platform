import { useEffect } from "react";

const AmbientBackground = () => {
  useEffect(() => {
    const root = document.documentElement;
    let frameId = 0;

    const updatePointer = (event) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", updatePointer);
    return () => {
      window.removeEventListener("pointermove", updatePointer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.14),transparent_26%),linear-gradient(180deg,rgba(250,252,255,1)_0%,rgba(240,245,250,1)_48%,rgba(247,250,253,1)_100%)]" />
      <div className="absolute inset-0 panel-grid opacity-[0.22] mix-blend-multiply" />

      <div className="hero-orb hero-orb-slow -left-32 top-[12vh] h-72 w-72 bg-accent-500/16" />
      <div className="hero-orb hero-orb-fast -right-20 top-[18vh] h-80 w-80 bg-cyan-500/12" />
      <div className="hero-orb hero-orb-slow -bottom-28 left-[32%] h-96 w-96 bg-purple-500/10" />

      <div
        className="absolute h-56 w-56 rounded-full bg-white/60 blur-3xl transition-transform duration-200 ease-out"
        style={{
          left: "var(--pointer-x, 50vw)",
          top: "var(--pointer-y, 36vh)",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),transparent_25%,rgba(255,255,255,0.32)_50%,transparent_75%)] opacity-35 mask-[linear-gradient(180deg,black,transparent_92%)]" />
    </div>
  );
};

export default AmbientBackground;
