import React, { useRef, useState, useEffect } from "react";
import { Maximize2, X, Play, Pause } from "lucide-react";

// Check if device is mobile
const isMobile = () => window.innerWidth < 768;

interface VideoThumbnailProps {
  src: string;
  title: string;
  aspectRatio?: "video" | "vertical";
  className?: string;
  isShowreel?: boolean;
  poster?: string; // 👈 optional thumbnail
}

export function VideoThumbnail({
  src,
  title,
  aspectRatio = "video",
  className = "",
  isShowreel = false,
  poster,
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const aspectClasses =
    aspectRatio === "vertical" ? "aspect-[9/16]" : "aspect-video";

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleClick = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen();
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer ${aspectClasses} rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] !rounded-none !aspect-auto w-screen h-screen bg-black"
          : isMobile()
          ? ""
          : "hover:shadow-xl hover:scale-105"
      } ${className}`}
    >
      {/* Video element */}
      {isInView && (
        <video
          ref={videoRef}
          className={`w-full h-full transition-opacity duration-300 ${
            isFullscreen ? "object-contain" : "object-cover"
          }`}
          preload="metadata" // 👈 ensures preview frame loads
          playsInline
          loop={isShowreel}
          muted
          poster={poster || undefined} // 👈 fallback thumbnail if given
          onLoadedData={() => setVideoLoaded(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Play/Pause Overlay */}
      <div
        className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-500 ${
          isPlaying && videoLoaded ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClick}
      >
        <button className="p-4 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm">
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>
      </div>

      {/* Hover overlay */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      )}

      {/* Fullscreen button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFullscreen();
        }}
        className={`absolute bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
          isFullscreen
            ? "top-8 right-8 w-12 h-12 opacity-100"
            : "top-4 right-4 w-10 h-10 opacity-0 group-hover:opacity-100"
        }`}
      >
        {isFullscreen ? (
          <X size={20} className="text-white" />
        ) : (
          <Maximize2 size={16} className="text-white" />
        )}
      </button>

      {/* Title Badge */}
      <div
        className={`absolute transition-all duration-300 ${
          isFullscreen
            ? "bottom-8 left-8 opacity-100"
            : "bottom-4 left-4 opacity-0 group-hover:opacity-100"
        }`}
      >
        <span
          className={`text-white font-bosenAlt bg-black/50 px-3 py-1 rounded-full ${
            isFullscreen ? "text-lg" : "text-sm"
          }`}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

export default VideoThumbnail;
