import { Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Video thumbnail/placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 16px)`
          }}></div>
        </div>
      </div>

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
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
          See our advanced AI algorithms analyze news credibility in real-time • 2:34
        </p>
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-6 right-6 flex items-center space-x-2">
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Loading indicator when playing */}
      {isPlaying && (
        <div className="absolute top-4 left-4">
          <div className="w-2 h-2 bg-[#0066FF] rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}