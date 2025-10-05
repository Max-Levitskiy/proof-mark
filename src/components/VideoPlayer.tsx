import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = "ZGSfEQOC6yc"; // YouTube video ID

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {!isPlaying ? (
        <>
          {/* Video thumbnail from YouTube */}
          <div className="absolute inset-0">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to standard quality thumbnail if maxres not available
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
              }}
            />
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={handlePlayClick}
              className="w-20 h-20 rounded-full bg-[#0066FF]/20 hover:bg-[#0066FF]/30 backdrop-blur-sm border border-[#0066FF]/30 transition-all duration-300 hover:scale-110"
            >
              <Play className="w-8 h-8 text-[#0066FF] ml-1" fill="currentColor" />
            </Button>
          </div>

          {/* Video title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              How ProofMark AI Detects Misinformation
            </h2>
            <p className="text-gray-300 text-sm">
              See our advanced AI algorithms analyze news credibility in real-time
            </p>
          </div>
        </>
      ) : (
        // YouTube iframe player with autoplay
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="ProofMark AI Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
