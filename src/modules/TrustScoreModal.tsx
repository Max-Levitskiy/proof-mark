import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface TrustScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  confidenceLevel: number;
  explanation: string;
  newsHeadline?: string;
}

export function TrustScoreModal({ isOpen, onClose, score, confidenceLevel, explanation, newsHeadline }: TrustScoreModalProps) {
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
      <DialogContent className="max-w-md mx-auto bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto [&>button]:text-gray-400 [&>button:hover]:text-gray-100 [&>button]:opacity-100 [&>button]:focus:ring-gray-600 [&>button]:ring-offset-gray-900 [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-gray-100">
            {scoreInfo.icon}
            Trust Score Analysis
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed analysis of news credibility and reliability indicators
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* News Headline */}
          {newsHeadline && (
            <div className="p-3 bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-1 text-gray-100">Analyzing:</h4>
              <p className="text-sm text-gray-400">{newsHeadline}</p>
            </div>
          )}

          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Badge className={`${getScoreColor(score)} text-white px-4 py-2 text-lg border-0`}>
                {getScoreRank(score)} ({score})
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-100">
                <span>Trust Score</span>
                <span>{score}/100</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            {/* Confidence Level */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-100">
                <span>Confidence Level</span>
                <span>{confidenceLevel}%</span>
              </div>
              <Progress value={confidenceLevel} className="h-2" />
            </div>
          </div>

          {/* Score Meaning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {scoreInfo.icon}
              <h3 className="font-semibold text-gray-100">{scoreInfo.title}</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {scoreInfo.description}
            </p>
          </div>

          <Separator className="my-6 bg-gray-700" />

          {/* Confidence Level Explanation */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-100">Confidence Level</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              The confidence level reflects how certain the AI system is about this trust score assessment, based on the quality and consistency of detected signals. Higher values indicate more certainty in the evaluation.
            </p>
          </div>

          <Separator className="my-6 bg-gray-700" />

          {/* AI Analysis Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-100">AI Analysis Details</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {explanation}
            </p>
          </div>

          <Separator className="my-6 bg-gray-700" />

          {/* Score Scale Reference */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-100">Trust Score Scale</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-100">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  AAA (80-100)
                </span>
                <span className="text-gray-400">Exceptional</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-100">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  AA (60-79)
                </span>
                <span className="text-gray-400">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-100">
                  <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                  A (40-59)
                </span>
                <span className="text-gray-400">Moderate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-100">
                  <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                  B (20-39)
                </span>
                <span className="text-gray-400">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-100">
                  <div className="w-3 h-3 bg-red-600 rounded"></div>
                  C (0-19)
                </span>
                <span className="text-gray-400">Poor</span>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-gray-700" />

          {/* Footer */}
          <div>
            <p className="text-xs text-gray-400 text-center">
              AI-Powered Analysis
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}