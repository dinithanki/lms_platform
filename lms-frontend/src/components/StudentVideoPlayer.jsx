import { useState } from "react";

export default function StudentVideoPlayer({ videoUrl, lessonTitle }) {
  // If we have a videoUrl, we start in a loading state because the iframe needs to load.
  const [loading, setLoading] = useState(!!videoUrl);

  console.log("📩 Video URL received:", videoUrl);

  // 🔧 Convert YouTube URL → embed URL
  const getEmbedUrl = (url) => {
    if (!url) return "";

    console.log("🔍 Processing URL:", url);

    try {
      if (url.includes("watch?v=")) {
        const videoId = url.split("watch?v=")[1].split("&")[0];
        console.log("🎯 Detected format: watch?v=");
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0].split("&")[0];
        console.log("🎯 Detected format: youtu.be");
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("embed/")) {
        console.log("🎯 Already embed format");
        return url;
      } else {
        // Return as is if it doesn't match standard patterns
        return url;
      }
    } catch (error) {
      console.error("❌ Error parsing video URL:", error);
      return url;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="text-indigo-600">🎥</span> {lessonTitle || "Lesson Video"}
        </h2>
      </div>

      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl shadow-slate-250/20">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-sm z-10 transition-all duration-300">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-350 font-medium">Loading video...</p>
          </div>
        )}

        {embedUrl ? (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={lessonTitle || "Video player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => {
              console.log("✅ Video iframe loaded successfully");
              setLoading(false);
            }}
            onError={() => {
              console.log("❌ Video iframe failed to load");
              setLoading(false);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xs font-semibold">No video URL available for this lesson</p>
          </div>
        )}
      </div>
    </div>
  );
}
