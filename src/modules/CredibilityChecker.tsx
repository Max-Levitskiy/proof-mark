import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search, Zap, ThumbsUp, Sparkles, ChevronDown, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CredibilityCheckerProps {
  onDeepResearchToggle: () => void;
  onTrustScoreClick: (score: number, explanation: string, headline: string) => void;
}

export function CredibilityChecker({ onDeepResearchToggle }: CredibilityCheckerProps) {
  const [text, setText] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [deepResearch, setDeepResearch] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const detectLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[^\s]{2,})/gi;
    return urlRegex.test(text);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    
    if (detectLinks(value)) {
      setHasError(true);
      setAnalysis(null);
    } else {
      setHasError(false);
      // Clear previous analysis when text changes
      setAnalysis(null);
    }
  };

  const performAnalysis = async (_text: string) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock analysis result
    const mockAnalysis = {
      trustScore: Math.floor(Math.random() * 40) + 60, // 60-100
      summary: "This text appears to discuss current events with factual language patterns.",
      sources: Math.floor(Math.random() * 5) + 3,
      flags: [
        "No obvious bias indicators detected",
        "Language patterns suggest factual reporting",
        "No misleading claims identified"
      ],
      recommendation: "This content shows indicators of reliable reporting, but cross-reference with multiple sources for verification."
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const handleDeepResearchToggle = (checked: boolean) => {
    setDeepResearch(checked);
    if (checked) {
      onDeepResearchToggle();
      // Reset the toggle after showing modal
      setTimeout(() => setDeepResearch(false), 100);
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Verify News Credibility</h2>
        <p className="text-muted-foreground">
          Paste your news content below for instant AI-powered credibility analysis
        </p>
      </div>

      <Card className="bg-card border border-gray-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl">News Content Analysis</CardTitle>
            <div className="flex items-center space-x-2 sm:ml-auto">
              <Label htmlFor="deep-research" className="text-sm">Deep Research</Label>
              <Switch
                id="deep-research"
                checked={deepResearch}
                onCheckedChange={handleDeepResearchToggle}
              />
              <Zap className="w-4 h-4 text-[#0066FF]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your news article text here for credibility analysis... (No links allowed - text only)"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className={`min-h-32 resize-none ${hasError ? 'border-destructive' : ''}`}
            />
            
            {hasError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Links are not supported. Please paste text content only.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {!hasError && text.trim() && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button 
                      onClick={() => performAnalysis(text)}
                      disabled={isAnalyzing || text.trim().length < 20}
                      className="w-full bg-[#0066FF] hover:bg-[#0056e6] text-white disabled:opacity-50"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {isAnalyzing ? "Analyzing..." : "Analyze Credibility"}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isAnalyzing 
                      ? "Analysis in progress..." 
                      : text.trim().length < 20 
                        ? `Need ${20 - text.trim().length} more characters (minimum 20)`
                        : "Click to analyze credibility"
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {isAnalyzing && (
        <Card className="bg-card border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0066FF]"></div>
              <span>AI is analyzing the credibility of your content...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && !isAnalyzing && (
        <div className="bg-card border border-[rgba(218,221,229,0.1)] rounded-2xl p-8 relative overflow-hidden">
          {/* Background light effect */}
          <div className="absolute right-[-20px] top-[-113px] w-[100px] h-[266px] rotate-[286.27deg]">
            <div className="bg-[#31ff8e] blur-[125px] filter h-full w-full opacity-30" />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 relative z-10">
            {/* Left Column - News Content */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-light">
                  Credibility Analysis
                </p>
                <h3 className="text-xl text-gray-100">
                  News Content Analysis Results
                </h3>
              </div>

              <div className="text-sm text-gray-500 space-y-3 leading-relaxed">
                <p>{analysis.summary}</p>
                <p>This analysis demonstrates consistent factual reporting with verifiable sources and cross-references. The claims are supported by credible evidence and expert opinions.</p>
                <p>Key indicators show reliable sourcing patterns, balanced perspective presentation, and adherence to journalistic standards for factual reporting.</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-border opacity-10 mx-4"></div>

            {/* Right Column - Analysis */}
            <div className="flex-1 space-y-4" ref={tooltipRef}>
              {/* Trust Score Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 relative">
                  <p className="text-sm text-gray-500">
                    ProofMark Trust Score
                  </p>
                  <button
                    onClick={() => setActiveTooltip(activeTooltip === -1 ? null : -1)}
                    className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-400 transition-colors"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>

                  {activeTooltip === -1 && (
                    <div className="absolute left-0 top-6 w-80 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg z-50">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-100">ProofMark Trust Score</h4>
                        <div className="text-xs text-gray-500 leading-relaxed space-y-2">
                          <p>Our proprietary AI-powered scoring system that evaluates news credibility on a scale of 0-100.</p>
                          <div className="space-y-2">
                            <p><strong className="text-gray-100">AAA (80-100):</strong> <span className="text-[#31ff8e]">Highly reliable</span> <span className="text-gray-500">- Multiple verified sources, strong factual accuracy</span></p>
                            <p><strong className="text-gray-100">AA (60-79):</strong> <span className="text-[#31ff8e]">Generally reliable</span> <span className="text-gray-500">- Good sourcing with minor concerns</span></p>
                            <p><strong className="text-gray-100">A (40-59):</strong> <span className="text-yellow-500">Moderate reliability</span> <span className="text-gray-500">- Mixed indicators, verify independently</span></p>
                            <p><strong className="text-gray-100">B (20-39):</strong> <span className="text-yellow-500">Low reliability</span> <span className="text-gray-500">- Significant credibility concerns</span></p>
                            <p><strong className="text-gray-100">C (0-19):</strong> <span className="text-red-500">Unreliable</span> <span className="text-gray-500">- High risk of misinformation</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
                    </div>
                  )}
                </div>
                <div className="bg-[rgba(49,255,142,0.05)] rounded-lg p-2 flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[rgba(49,255,142,0.2)]">
                    {analysis.trustScore.toFixed(2)}
                  </span>
                  <div className="bg-[#31ff8e] rounded px-2 py-1">
                    <span className="text-[#0a331c] font-semibold text-xl">AAA</span>
                  </div>
                </div>
              </div>

              {/* Analysis Factors */}
              <div className="space-y-1">
                {[
                  { 
                    name: "Cross-check with official statements",
                    description: "Verifies if the news content aligns with official government, organizational, or institutional statements and press releases to ensure accuracy and prevent misinformation."
                  },
                  { 
                    name: "Multiple independent confirmations",
                    description: "Checks if the same information has been independently reported by multiple credible news sources to validate the story's authenticity and reduce single-source bias."
                  },
                  { 
                    name: "Source credibility",
                    description: "Evaluates the reliability and track record of the sources cited in the article, including their expertise, past accuracy, and potential conflicts of interest."
                  },
                  { 
                    name: "Social spread pattern",
                    description: "Analyzes how the information spreads on social media to identify potential manipulation, bot activity, or coordinated inauthentic behavior that could indicate misinformation."
                  },
                  { 
                    name: "Author reputation",
                    description: "Assesses the journalist's or author's professional background, previous work quality, credentials, and history of accurate reporting to gauge content reliability."
                  },
                  { 
                    name: "Language reliability",
                    description: "Examines the writing style, tone, and language patterns for indicators of bias, emotional manipulation, or sensationalism that might compromise factual reporting."
                  },
                  { 
                    name: "Metadata consistency",
                    description: "Checks digital fingerprints, timestamps, and technical metadata for signs of content manipulation, deepfakes, or other forms of digital tampering."
                  }
                ].map((factor, index) => (
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
              </div>

              {/* Analysis Summary */}
              <div className="bg-[rgba(218,221,229,0.02)] border border-[rgba(218,221,229,0.05)] rounded-xl p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="w-6 h-6 text-gray-100" />
                  <span className="text-gray-100 font-light">Analysis Summary</span>
                </div>
                <p className="text-xs text-gray-500 font-light leading-relaxed mt-2">
                  {analysis.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* See Sources Button */}
          <div className="mt-6 pt-4">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <span>See sources</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}