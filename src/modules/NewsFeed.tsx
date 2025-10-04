import { useEffect, useRef, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { useNews } from "@/api/news";

interface NewsFeedProps {
  onNewsCardClick: (id: string) => void;
  onDetailedAnalysis: (id: string, headline: string) => void;
  onTrustScoreClick: (score: number, explanation: string, headline: string) => void;
}

export function NewsFeed({ onNewsCardClick, onDetailedAnalysis, onTrustScoreClick }: NewsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch news with TanStack Query
  const { data: newsItems = [], isLoading } = useNews();

  // Don't render if no news
  if (!isLoading && newsItems.length === 0) {
    return null;
  }


  // Auto-scroll functionality
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (!isHovered && scrollContainer) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
      }
    };

    // Start the interval
    intervalRef.current = setInterval(scroll, 50);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Trending News</h2>
        <p className="text-muted-foreground">Real-time credibility analysis of breaking stories</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Duplicate the items to create seamless loop */}
        {[...newsItems, ...newsItems].map((item, index) => (
          <NewsCard
            key={`${item.id}-${index}`}
            {...item}
            onCardClick={onNewsCardClick}
            onDetailedAnalysis={onDetailedAnalysis}
            onTrustScoreClick={onTrustScoreClick}
          />
        ))}
      </div>
    </div>
  );
}