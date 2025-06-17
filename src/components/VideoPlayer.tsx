import { useFeatures } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, Play } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  thumbnailUrl: string;
  requiredTier?: 'free' | 'driven' | 'aspiring' | 'breakthrough';
}

export function VideoPlayer({ 
  videoId, 
  title, 
  description, 
  thumbnailUrl, 
  requiredTier = 'free'
}: VideoPlayerProps) {
  const { hasAccess, userTier } = useFeatures();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if user has access to this video based on their tier
  const canAccess = requiredTier === 'free' || 
    hasAccess(requiredTier === 'breakthrough' ? 'PGV_ACADEMY' : 'AI_ANALYSIS');

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  if (!canAccess) {
    return (
      <div className="relative group">
        {/* Blurred thumbnail */}
        <div className="relative">
          <img 
            src={thumbnailUrl} 
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover rounded-lg filter blur-sm"
          />
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Video info with upgrade button */}
        {(title || description) && (
          <div className="mt-4 space-y-2">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-sm text-gray-600">{description}</p>}
            <div className="pt-2">
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full bg-pgv-green hover:bg-pgv-green/90"
              >
                Upgrade to {requiredTier} Tier
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="relative aspect-video group cursor-pointer" onClick={handlePlayClick}>
        <img 
          src={thumbnailUrl} 
          alt={title || "Video thumbnail"}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-lg">
          <div className="w-16 h-16 bg-pgv-green/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video player */}
      <div className="relative aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
          className="absolute inset-0 w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video info */}
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
    </div>
  );
}