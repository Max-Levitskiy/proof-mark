import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Image } from "@/components/Image";

interface HeaderProps {
  user: {
    isSignedIn: boolean;
    name: string;
    email: string;
    avatar: string;
  };
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Header({ user, onSignIn, onSignOut }: HeaderProps) {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>

        {user.isSignedIn ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button 
              onClick={onSignOut}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onSignIn}
            className="bg-[#0066FF] hover:bg-[#0056e6] text-white"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Google
          </Button>
        )}
      </div>
    </header>
  );
}