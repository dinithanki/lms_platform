import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";

const StudentVideoPlayer = ({ videoUrl, lessonTitle, user, isEnrolled }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [played, setPlayed] = useState(0); // Progress (0 to 1)
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Show/hide controls handler
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setSpeedDropdownOpen(false);
      }, 3000);
    }
  };

  // Trigger controls visibility change when play/pause changes
  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      handleMouseMove();
    }
  }, [playing]);

  // Reset progress when videoUrl changes
  useEffect(() => {
    setPlayed(0);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
  }, [videoUrl]);

  // Security check guard
  if (!user || user.role !== "STUDENT" || !isEnrolled) {
    return (
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20 w-fit mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-1">Access Denied</h3>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
          Only enrolled students are authorized to view lesson video materials.
        </p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="aspect-video w-full bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-inner">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-500 mb-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">No Video Available</h3>
        <p className="text-[11px] text-slate-500 max-w-xs">
          This lesson module does not have a video tutorial configured.
        </p>
      </div>
    );
  }

  // Play/Pause toggle
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // Progress update handler
  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
    }
  };

  // Duration metadata loader
  const handleDuration = (dur) => {
    setDuration(dur);
  };

  // Seek bar slide handlers
  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    setPlayed(val);
    setCurrentTime(val * duration);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    const val = parseFloat(e.target.value);
    playerRef.current.seekTo(val);
  };

  // Click on video area to play/pause
  const handleVideoClick = (e) => {
    // Prevent toggling when clicking controls container or buttons
    if (e.target.closest(".custom-controls-container")) return;
    handlePlayPause();
  };

  // Volume slider handlers
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setMuted(vol === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  // Fullscreen trigger
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Speed handlers
  const handleSelectSpeed = (speed) => {
    setPlaybackRate(speed);
    setSpeedDropdownOpen(false);
  };

  // Helper: format seconds to M:SS or H:MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const date = new Date(secs * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = String(date.getUTCSeconds()).padStart(2, "0");
    if (hh) {
      return `${hh}:${String(mm).padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const speedOptions = [0.5, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="flex flex-col gap-3">
      {/* Active Lesson Banner info */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
          Now Watching
        </span>
        <h2 className="text-sm font-bold text-slate-100">{lessonTitle}</h2>
      </div>

      {/* Main Video Wrapper */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (playing) {
            setShowControls(false);
            setSpeedDropdownOpen(false);
          }
        }}
        onClick={handleVideoClick}
        className="aspect-video w-full bg-slate-950 rounded-2xl relative overflow-hidden group shadow-2xl border border-slate-800/80 cursor-pointer flex items-center justify-center select-none"
      >
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          volume={muted ? 0 : volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
          playsinline
        />

        {/* Large Play/Pause center overlay (shown briefly or when paused) */}
        {!playing && (
          <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center transition-all duration-300 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-indigo-600/90 border border-indigo-400/30 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 transform group-hover:scale-110 transition-transform duration-200">
              <svg className="w-7 h-7 ml-1 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Controls Overlay container */}
        <div
          className={`custom-controls-container absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-4 flex flex-col gap-3 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()} // stop clicks on control bar from pausing video
        >
          {/* Progress Seek Bar slider */}
          <div className="flex items-center gap-3 group/slider">
            <span className="text-[10px] font-bold text-slate-300 shrink-0">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none transition-all duration-150 hover:h-2"
              style={{
                background: `linear-gradient(to right, rgb(99, 102, 241) ${played * 100}%, rgb(30, 41, 59) ${played * 100}%)`,
              }}
            />

            <span className="text-[10px] font-bold text-slate-300 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center justify-between">
            {/* Left group: Play, volume */}
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="text-slate-100 hover:text-indigo-400 transition-colors p-1 rounded-lg hover:bg-slate-900/50 cursor-pointer"
                title={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume & Mute */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={handleToggleMute}
                  className="text-slate-100 hover:text-indigo-400 transition-colors p-1 rounded-lg hover:bg-slate-900/50 cursor-pointer"
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.03c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none hover:h-1.5 transition-all"
                  style={{
                    background: `linear-gradient(to right, rgb(99, 102, 241) ${(muted ? 0 : volume) * 100}%, rgb(30, 41, 59) ${(muted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
            </div>

            {/* Right group: Playback speed and fullscreen */}
            <div className="flex items-center gap-3 relative">
              {/* Playback speed trigger */}
              <div className="relative">
                <button
                  onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
                  className="text-xs font-bold px-2.5 py-1.5 border border-slate-700/50 bg-slate-900/40 hover:bg-slate-850 text-slate-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Playback Speed"
                >
                  <span>{playbackRate === 1.0 ? "Normal" : `${playbackRate}x`}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${speedDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Speed Dropdown Menu */}
                {speedDropdownOpen && (
                  <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-2xl z-20 flex flex-col min-w-[80px]">
                    {speedOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelectSpeed(opt)}
                        className={`text-left text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          playbackRate === opt
                            ? "bg-indigo-600 text-slate-100"
                            : "text-slate-400 hover:text-indigo-400 hover:bg-slate-850"
                        }`}
                      >
                        {opt === 1.0 ? "Normal" : `${opt}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={handleToggleFullscreen}
                className="text-slate-100 hover:text-indigo-400 transition-colors p-1 rounded-lg hover:bg-slate-900/50 cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentVideoPlayer;
