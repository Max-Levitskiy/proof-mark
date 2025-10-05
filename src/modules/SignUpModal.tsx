import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Mail, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/api/AuthContext";
import { useSubscribeToFeature } from "@/api/subscriptions";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const { user } = useAuth();
  const subscribeMutation = useSubscribeToFeature();
  
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill email when logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setErrorMessage("");
    
    const result = await subscribeMutation.mutateAsync({
      email,
      featureName: 'deep_research_mode',
      userId: user?.id ?? null,
    });
    
    if (result.success) {
      setIsSubmitted(true);
      setIsAlreadySubscribed(Boolean(result.alreadySubscribed));
    } else {
      setErrorMessage(result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSubmitted(false);
    setIsAlreadySubscribed(false);
    setErrorMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto [&>button]:text-gray-400 [&>button:hover]:text-gray-100 [&>button]:opacity-100 [&>button]:focus:ring-gray-600 [&>button]:ring-offset-gray-900 [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-100">
            <Zap className="w-5 h-5 text-[#0066FF]" />
            <span>Deep Research Mode</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign up to access advanced AI research capabilities
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 border-blue-600/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-100">Advanced Features Coming Soon</h4>
                    <p className="text-sm text-gray-400">
                      Deep Research mode will provide comprehensive fact-checking, source verification, and bias analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-100">Stay Updated</h4>
              <p className="text-sm text-gray-400">
                Subscribe to get notified when Deep Research and other advanced features become available.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-100">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 border border-red-900/30 rounded-md p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={subscribeMutation.isPending || !email.trim()}
                className="w-full bg-[#0066FF] hover:bg-[#0056e6] text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe for Updates"}
              </Button>
            </form>

            <p className="text-xs text-gray-400 text-center">
              We'll only send you updates about new features. No spam, unsubscribe anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-100">
                {isAlreadySubscribed ? "You're already subscribed!" : "You're All Set!"}
              </h4>
              <p className="text-sm text-gray-400">
                {isAlreadySubscribed
                  ? (<>We found an existing subscription for <strong className="text-gray-100">{email}</strong> to Deep Research mode updates.</>)
                  : (<>We'll notify you at <strong className="text-gray-100">{email}</strong> when Deep Research mode is available.</>)
                }
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