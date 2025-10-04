import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Sparkles } from "lucide-react";

interface DetailedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsHeadline: string;
}

export function DetailedAnalysisModal({ isOpen, onClose, newsHeadline }: DetailedAnalysisModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState("");

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult = `Based on your request "${prompt}", here's a detailed analysis of "${newsHeadline}":

• **Alternative Perspectives**: This story could be viewed through economic, social, and technological lenses, each offering different insights into the implications.

• **Source Verification**: Cross-referenced with 12 primary sources including government databases, academic papers, and verified expert statements.

• **Potential Biases**: The original reporting shows minimal bias indicators, with balanced presentation of facts and expert opinions.

• **Context & Background**: This development builds on previous events from the past 6 months, showing a consistent pattern in the field.

• **Impact Assessment**: The implications extend beyond the immediate scope, potentially affecting related industries and stakeholder groups.

**Recommendation**: This appears to be a credible report with strong factual foundation. However, monitor for updates as the situation develops.`;
    
    setResult(mockResult);
    setIsAnalyzing(false);
  };

  const handleClose = () => {
    setPrompt("");
    setResult("");
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 [&>button]:text-gray-400 [&>button:hover]:text-gray-100 [&>button]:opacity-100 [&>button]:focus:ring-gray-600 [&>button]:ring-offset-gray-900 [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-100">
            <Sparkles className="w-5 h-5 text-[#0066FF]" />
            <span>Detailed Analysis</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Request a custom analysis with your specific prompt or question
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-100">Analyzing:</p>
            <p className="text-sm text-gray-400 mt-1">{newsHeadline}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysis-prompt" className="text-gray-100">Custom Analysis Request</Label>
            <Textarea
              id="analysis-prompt"
              placeholder="e.g., 'Analyze this news from a different perspective', 'What are the potential biases?', 'Compare with similar events in the past'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!prompt.trim() || isAnalyzing}
            className="w-full bg-[#0066FF] hover:bg-[#0056e6] text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Generate Analysis"}
          </Button>

          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
              <span className="ml-3 text-gray-100">AI is analyzing your request...</span>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-3">
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-semibold mb-3 text-gray-100">Analysis Results</h4>
                <div className="bg-gray-800 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-100">{result}</pre>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  Close
                </Button>
                <Button className="bg-[#0066FF] hover:bg-[#0056e6] text-white">
                  Save Analysis
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}