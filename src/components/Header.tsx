import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import type { User } from "@/types/user";

interface HeaderProps {
  user: User | null;
  authLoading?: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Header({ user, authLoading = false, onSignIn, onSignOut }: HeaderProps) {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/70 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>

        {authLoading ? (
          <div className="w-24 h-10" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-100">{user.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={onSignOut}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-gray-100"
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