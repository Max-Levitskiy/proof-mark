import { signInWithGoogle, signOut } from '@/api/auth';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/user';

interface AuthButtonProps {
  user: User | null;
}

export function AuthButton({ user }: AuthButtonProps) {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.full_name || user.email}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-sm text-gray-700">
          {user.full_name || user.email}
        </span>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleSignIn} variant="default">
      Sign in with Google
    </Button>
  );
}
