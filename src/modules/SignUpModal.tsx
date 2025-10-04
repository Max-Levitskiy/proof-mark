import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Mail, CheckCircle, ArrowRight } from "lucide-react";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setEmail("");
    setIsSubmitting(false);
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#0066FF]" />
            <span>Deep Research Mode</span>
          </DialogTitle>
          <DialogDescription>
            Sign up to access advanced AI research capabilities
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-[#0066FF]/10 to-[#0066FF]/5 border border-[#0066FF]/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Advanced Features Coming Soon</h4>
                    <p className="text-sm text-muted-foreground">
                      Deep Research mode will provide comprehensive fact-checking, source verification, and bias analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Subscribe to get notified when Deep Research and other advanced features become available.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full bg-[#0066FF] hover:bg-[#0056e6] text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isSubmitting ? "Subscribing..." : "Subscribe for Updates"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              We'll only send you updates about new features. No spam, unsubscribe anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">You're All Set!</h4>
              <p className="text-sm text-muted-foreground">
                We'll notify you at <strong>{email}</strong> when Deep Research mode is available.
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              <Button onClick={handleClose} className="bg-[#0066FF] hover:bg-[#0056e6] text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Exploring
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}