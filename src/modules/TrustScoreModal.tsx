import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface TrustScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  explanation: string;
  newsHeadline?: string;
}

export function TrustScoreModal({ isOpen, onClose, score, explanation, newsHeadline }: TrustScoreModalProps) {
  const getScoreRank = (score: number) => {
    if (score >= 80) return "AAA";
    if (score >= 60) return "AA";
    if (score >= 40) return "A";
    if (score >= 20) return "B";
    return "C";
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return "bg-green-600";
    if (score >= 20) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return {
      title: "Exceptional Credibility",
      description: "This content demonstrates the highest standards of journalistic integrity with verified sources, factual accuracy, and minimal bias. Safe to trust and share.",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    };
    if (score >= 60) return {
      title: "High Credibility", 
      description: "Reliable content from trustworthy sources with good fact-checking standards. Minor concerns may exist but overall credible and dependable.",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    };
    if (score >= 40) return {
      title: "Moderate Credibility",
      description: "Mixed reliability indicators. Some concerns about sourcing, bias, or accuracy detected. Cross-reference with other sources recommended.",
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
    };
    if (score >= 20) return {
      title: "Low Credibility",
      description: "Significant credibility issues identified including questionable sources, potential bias, or factual inaccuracies. Exercise caution and verify independently.",
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
    };
    return {
      title: "Poor Credibility",
      description: "Major red flags detected including unreliable sources, significant bias, misinformation, or fabricated content. High risk - verification strongly recommended.",
      icon: <XCircle className="w-5 h-5 text-red-600" />
    };
  };

  const scoreInfo = getScoreDescription(score);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {scoreInfo.icon}
            Trust Score Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of news credibility and reliability indicators
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* News Headline */}
          {newsHeadline && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-1">Analyzing:</h4>
              <p className="text-sm text-muted-foreground">{newsHeadline}</p>
            </div>
          )}

          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Badge className={`${getScoreColor(score)} text-white px-4 py-2 text-lg`}>
                {getScoreRank(score)} ({score})
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trust Score</span>
                <span>{score}/100</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          </div>

          {/* Score Meaning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {scoreInfo.icon}
              <h3 className="font-semibold">{scoreInfo.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scoreInfo.description}
            </p>
          </div>

          {/* AI Analysis Details */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">AI Analysis Details</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Score Scale Reference */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Trust Score Scale</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  AAA (80-100)
                </span>
                <span className="text-muted-foreground">Exceptional</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  AA (60-79)
                </span>
                <span className="text-muted-foreground">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                  A (40-59)
                </span>
                <span className="text-muted-foreground">Moderate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                  B (20-39)
                </span>
                <span className="text-muted-foreground">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  C (0-19)
                </span>
                <span className="text-muted-foreground">Poor</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground text-center">
              AI Analysis • Updated 2 minutes ago
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}