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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,126,247,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(20,184,214,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,1)_0%,rgba(9,17,31,1)_45%,rgba(3,7,18,1)_100%)]" />
      <div className="absolute inset-0 panel-grid opacity-[0.22] mix-blend-soft-light" />

      <div className="hero-orb hero-orb-slow left-[-8rem] top-[12vh] h-72 w-72 bg-accent-500/18" />
      <div className="hero-orb hero-orb-fast right-[-5rem] top-[18vh] h-80 w-80 bg-cyan-500/14" />
      <div className="hero-orb hero-orb-slow bottom-[-7rem] left-[32%] h-96 w-96 bg-purple-500/12" />

      <div
        className="absolute h-56 w-56 rounded-full bg-white/8 blur-3xl transition-transform duration-200 ease-out"
        style={{
          left: "var(--pointer-x, 50vw)",
          top: "var(--pointer-y, 36vh)",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] opacity-30 [mask-image:linear-gradient(180deg,black,transparent_92%)]" />
    </div>
  );
};

export default AmbientBackground;
