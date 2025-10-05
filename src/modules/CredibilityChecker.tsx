import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { ArticleAnalysisCard } from "@/components/ArticleAnalysisCard";
import { MOCK_ANALYSIS_RESPONSE } from "@/data/mockAnalysisData";

interface ArticleResult {
  similarity: number;
  embedding_id: string;
  key: string;
  created_at: string;
  cluster_id: number;
  article: {
    id: string;
    news_id: string;
    headline: string;
    description: string | null;
    image: string;
    published_at: string;
    source: {
      uri: string;
      title: string;
      dataType: string;
    };
    original_link: string;
    trust_score: number;
    confidence_level: number;
    category: Array<{
      uri: string;
      wgt: number;
      label: string;
    }>;
    content: string;
  };
}

interface AnalysisResponse {
  order: string[];
  resultsByKey: Record<string, ArticleResult>;
  count: number;
}

interface CredibilityCheckerProps {
  onDeepResearchToggle: () => void;
  onTrustScoreClick: (score: number, confidenceLevel: number, explanation: string, headline: string) => void;
}

export function CredibilityChecker({ onDeepResearchToggle }: CredibilityCheckerProps) {
  const [text, setText] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [deepResearch, setDeepResearch] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);

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

  const performAnalysis = async (text: string) => {
    setIsAnalyzing(true);
    setAnalysisError(false);
    setAnalysis(null);
    setDisplayLimit(20); // Reset display limit on new analysis

    try {
      // Call Supabase Edge Function to get embeddings and similar articles
      const { data, error } = await supabase.functions.invoke('get-embeddings', {
        body: { query: text },
      });

      if (error) {
        console.error('Error calling get-embeddings function:', error);
        console.error('Error details:', error);
        setAnalysisError(true);
      } else if (data && data.order && data.order.length > 0) {
        // Set the response with similar articles
        setAnalysis(data as AnalysisResponse);
      } else {
        // No data found - show nothing found message without test data button
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Error analyzing text:', err);
      setAnalysisError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeepResearchToggle = (checked: boolean) => {
    setDeepResearch(checked);
    if (checked) {
      onDeepResearchToggle();
      // Reset the toggle after showing modal
      setTimeout(() => setDeepResearch(false), 100);
    }
  };

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
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Similar Articles Found</h3>
            <p className="text-sm text-gray-500">
              Found {analysis.order.length} articles with similar content (Total: {analysis.count})
            </p>
          </div>

          <div className="space-y-8">
            {analysis.order.slice(0, displayLimit).map((key) => {
              const result = analysis.resultsByKey[key];
              if (!result || !result.article) {
                return null;
              }

              const { article } = result;

              return (
                <ArticleAnalysisCard
                  key={key}
                  headline={article.headline}
                  content={article.content}
                  trustScore={article.trust_score}
                  source={article.source?.title || 'Unknown Source'}
                  publishedAt={article.published_at}
                  similarity={result.similarity}
                  originalLink={article.original_link}
                  articleId={article.id}
                />
              );
            })}
          </div>

          {analysis.order.length > displayLimit && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setDisplayLimit(prev => prev + 20)}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800/50"
              >
                Show More ({analysis.order.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      {analysisError && !isAnalyzing && (
        <Card className="bg-card border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-100">Error Analyzing Content</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  We encountered an error while analyzing your text. Please try again.
                </p>
              </div>
              <Button
                onClick={() => {
                  setAnalysisError(false);
                  setAnalysis(MOCK_ANALYSIS_RESPONSE as AnalysisResponse);
                }}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800/50"
              >
                Show Test Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!analysis && !isAnalyzing && !analysisError && text.trim() && !hasError && (
        <Card className="bg-card border-gray-800">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-100">No Similar Articles Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  We couldn't find any articles similar to your text. Try analyzing different content or check back later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}