import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { Image } from "@/components/Image";
import { Sparkles } from "lucide-react";

interface NewsCardProps {
  id: string;
  image: string;
  headline: string;
  description: string;
  category: string;
  trustScore: number;
  trustExplanation: string;
  onCardClick: (id: string) => void;
  onDetailedAnalysis: (id: string, headline: string) => void;
  onTrustScoreClick: (score: number, explanation: string, headline: string) => void;
}

export function NewsCard({ 
  id, 
  image, 
  headline, 
  description, 
  category, 
  trustScore, 
  trustExplanation,
  onCardClick,
  onDetailedAnalysis,
  onTrustScoreClick
}: NewsCardProps) {
  return (
    <Card className="flex-shrink-0 w-80 bg-card border border-border hover:border-[#0066FF]/30 transition-all duration-300 hover:shadow-lg group cursor-pointer">
      <CardContent className="p-0" onClick={() => onCardClick(id)}>
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <Image 
            src={image}
            alt={headline}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              #{category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
            <TrustScoreBadge 
              score={trustScore} 
              explanation={trustExplanation}
              onOpenModal={() => onTrustScoreClick(trustScore, trustExplanation, headline)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-[#0066FF] transition-colors">
            {headline}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <span>2 hours ago</span>
            </div>
            
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDetailedAnalysis(id, headline);
              }}
              className="bg-[#0066FF] hover:bg-[#0056e6] text-white"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Detailed Analysis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}