import { useState, useRef } from "react";
import {  HelpCircle, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ArticleAnalysisCardProps {
  headline: string;
  content: string;
  trustScore: number;
  source?: string;
  publishedAt?: string;
  similarity: number;
  originalLink: string;
  articleId: string;
}

export function ArticleAnalysisCard({
  headline,
  content,
  trustScore,
  source,
  publishedAt,
  similarity,
  originalLink,
  articleId
}: ArticleAnalysisCardProps) {
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // const analysisFactors = [
  //   {
  //     name: "Cross-check with official statements",
  //     description: "Verifies if the news content aligns with official government, organizational, or institutional statements and press releases to ensure accuracy and prevent misinformation."
  //   },
  //   {
  //     name: "Multiple independent confirmations",
  //     description: "Checks if the same information has been independently reported by multiple credible news sources to validate the story's authenticity and reduce single-source bias."
  //   },
  //   {
  //     name: "Source credibility",
  //     description: "Evaluates the reliability and track record of the sources cited in the article, including their expertise, past accuracy, and potential conflicts of interest."
  //   },
  //   {
  //     name: "Social spread pattern",
  //     description: "Analyzes how the information spreads on social media to identify potential manipulation, bot activity, or coordinated inauthentic behavior that could indicate misinformation."
  //   },
  //   {
  //     name: "Author reputation",
  //     description: "Assesses the journalist's or author's professional background, previous work quality, credentials, and history of accurate reporting to gauge content reliability."
  //   },
  //   {
  //     name: "Language reliability",
  //     description: "Examines the writing style, tone, and language patterns for indicators of bias, emotional manipulation, or sensationalism that might compromise factual reporting."
  //   },
  //   {
  //     name: "Metadata consistency",
  //     description: "Checks digital fingerprints, timestamps, and technical metadata for signs of content manipulation, deepfakes, or other forms of digital tampering."
  //   }
  // ];

  return (
    <div className="bg-card border border-[rgba(218,221,229,0.1)] rounded-2xl p-8 relative overflow-hidden">
      {/* Background light effect */}
      <div className="absolute right-[-20px] top-[-113px] w-[100px] h-[266px] rotate-[286.27deg]">
        <div className="bg-[#31ff8e] blur-[125px] filter h-full w-full opacity-30" />
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        {/* Header with Trust Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 font-light">Similar Article</p>
              <span className="text-sm text-green-500 font-medium">
                {(similarity * 100).toFixed(1)}% match
              </span>
            </div>
            <h3 className="text-xl text-gray-100">{headline}</h3>
            {source && publishedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{source}</span>
                <span>•</span>
                <span>{new Date(publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Trust Score Section */}
          <div className="flex items-center gap-4" ref={tooltipRef}>
            <div className="flex items-center gap-1 relative">
              <p className="text-sm text-gray-500">Trust Score</p>
              <button
                onClick={() => setActiveTooltip(activeTooltip === -1 ? null : -1)}
                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-400 transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
              </button>

              {activeTooltip === -1 && (
                <div className="absolute right-0 top-6 w-80 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg z-50">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-100">ProofMark Trust Score</h4>
                    <div className="text-xs text-gray-500 leading-relaxed space-y-2">
                      <p>Our proprietary AI-powered scoring system that evaluates news credibility on a scale of 0-100.</p>
                      <div className="space-y-2">
                        <p><strong className="text-gray-100">AAA (80-100):</strong> <span className="text-[#31ff8e]">Highly reliable</span> <span className="text-gray-500">- Multiple verified sources, strong factual accuracy</span></p>
                        <p><strong className="text-gray-100">AA (60-79):</strong> <span className="text-[#31ff8e]">Generally reliable</span> <span className="text-gray-500">- Good sourcing with minor concerns</span></p>
                        <p><strong className="text-gray-100">A (40-59):</strong> <span className="text-gray-500">Moderate reliability</span> <span className="text-gray-500">- Mixed indicators, verify independently</span></p>
                        <p><strong className="text-gray-100">B (20-39):</strong> <span className="text-yellow-500">Low reliability</span> <span className="text-gray-500">- Significant credibility concerns</span></p>
                        <p><strong className="text-gray-100">C (0-19):</strong> <span className="text-red-500">Unreliable</span> <span className="text-gray-500">- High risk of misinformation</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
                </div>
              )}
            </div>
            <div className="bg-[rgba(49,255,142,0.05)] rounded-lg p-2 flex items-center gap-2">
              <span className="text-2xl font-semibold text-[rgba(49,255,142,0.2)]">
                {trustScore.toFixed(2)}
              </span>
              <div className="bg-[#31ff8e] rounded px-2 py-1">
                <span className="text-[#0a331c] font-semibold text-xl">
                  {trustScore >= 80 ? 'AAA' : trustScore >= 60 ? 'AA' : trustScore >= 40 ? 'A' : trustScore >= 20 ? 'B' : 'C'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Full Width */}
        <div className="text-sm text-gray-500 space-y-3 leading-relaxed">
          <p>{content}</p>
        </div>

        {/* Analysis Factors - Commented out for now */}
        {/* <div className="space-y-1">
          {analysisFactors.map((factor, index) => (
            <div key={index} className="bg-[rgba(218,221,229,0.02)] border border-[rgba(218,221,229,0.05)] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[rgba(49,255,142,0.05)] rounded p-1.5 w-6 h-6 flex items-center justify-center">
                  <ThumbsUp className="w-3 h-3 text-[#31ff8e] opacity-70" />
                </div>
                <span className="text-sm text-gray-400 font-light">
                  {factor.name}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveTooltip(activeTooltip === index ? null : index)}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>

                {activeTooltip === index && (
                  <div className="absolute right-0 top-6 w-72 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg z-50">
                    <div className="text-xs text-gray-500 leading-relaxed">
                      {factor.description}
                    </div>
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div> */}

        {/* Analysis Summary - Commented out for now */}
        {/* <div className="bg-[rgba(218,221,229,0.02)] border border-[rgba(218,221,229,0.05)] rounded-xl p-4">
          <div className="flex items-center gap-1 mb-2">
            <Sparkles className="w-6 h-6 text-gray-100" />
            <span className="text-gray-100 font-light">Analysis Summary</span>
          </div>
          <p className="text-xs text-gray-500 font-light leading-relaxed mt-2">
            This content shows indicators of reliable reporting with verifiable sources and cross-references. The claims are supported by credible evidence and expert opinions.
          </p>
        </div> */}

        {/* Action Buttons at Bottom */}
        <div className="flex gap-3 pt-4 border-t border-gray-800">
          <Button
            onClick={() => navigate(`/article/${articleId}`)}
            className="flex-1 bg-[#0066FF] hover:bg-[#0056e6] text-white"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            View Article Details
          </Button>
          <Button
            onClick={() => window.open(originalLink, '_blank', 'noopener,noreferrer')}
            variant="outline"
            className="flex-1 border-gray-700 hover:bg-gray-800/50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Read Original Source
          </Button>
        </div>
      </div>
    </div>
  );
}
