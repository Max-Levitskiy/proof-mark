import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { Image } from "@/components/Image";
import { Sparkles } from "lucide-react";
import { NewsCardDto } from "@/types/news";

interface NewsCardProps extends NewsCardDto {
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
    <Card className="flex-shrink-0 w-80 bg-card hover:border-blue-600/30 transition-all duration-300 hover:shadow-lg group overflow-hidden gap-0">
      <CardContent className="p-0 !pb-0">
        {/* Image */}
        <div className="relative overflow-hidden cursor-pointer" onClick={() => onCardClick(id)}>
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
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="cursor-pointer" onClick={() => onCardClick(id)}>
            <h3 className="font-semibold leading-tight line-clamp-2 hover:text-[#0066FF] transition-colors">
              {headline}
            </h3>

            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mt-3">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
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