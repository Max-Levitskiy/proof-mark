import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface TrustScoreBadgeProps {
  score: number;
  confidenceLevel: number;
  explanation?: string;
  onOpenModal: () => void;
}

export function TrustScoreBadge({ score, confidenceLevel, onOpenModal }: TrustScoreBadgeProps) {
  const getScoreRank = (score: number) => {
    if (score >= 80) return "AAA";
    if (score >= 60) return "AA";
    if (score >= 40) return "A";
    if (score >= 20) return "B";
    return "C";
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return "bg-green-600"; // AAA and AA (darker green)
    if (score >= 20) return "bg-yellow-600"; // A and B (darker yellow)
    return "bg-red-600"; // C (darker red)
  };



  return (
    <Button
      variant="ghost"
      className="p-0 h-auto hover:bg-transparent"
      onClick={onOpenModal}
    >
      <Badge className={`${getScoreColor(score)} text-white hover:opacity-80 cursor-pointer transition-opacity border-0`}>
        <span>{getScoreRank(score)} ({score})</span>
        <span className="ml-2 text-xs opacity-90">Conf {confidenceLevel}%</span>
        <Info className="w-3 h-3 ml-1" />
      </Badge>
    </Button>
  );
}
