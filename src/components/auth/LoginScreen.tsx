import { useState } from 'react';
import { Shield, User, Lock, LogIn } from 'lucide-react';
import { User as UserType, UserRole } from '@/types/legal';
import { mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface LoginScreenProps {
  onLogin: (user: UserType) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      const user = mockUsers.find(u => u.role === selectedRole);
      if (user) {
        onLogin(user);
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Shield className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">LASU Legal CMS</h1>
          <p className="mt-1 text-muted-foreground">
            Integrated Case Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-6 text-center text-lg font-semibold text-foreground">
            Sign in to continue
          </h2>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-foreground">
              Select Access Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole('admin')}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  selectedRole === 'admin'
                    ? "border-accent bg-accent/10"
                    : "border-border bg-background hover:border-accent/50"
                )}
              >
                <div className={cn(
                  "rounded-lg p-2",
                  selectedRole === 'admin' ? "bg-accent/20" : "bg-muted"
                )}>
                  <Shield className={cn(
                    "h-6 w-6",
                    selectedRole === 'admin' ? "text-accent-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Administrator</p>
                  <p className="text-xs text-muted-foreground">Full access</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('legal_officer')}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  selectedRole === 'legal_officer'
                    ? "border-accent bg-accent/10"
                    : "border-border bg-background hover:border-accent/50"
                )}
              >
                <div className={cn(
                  "rounded-lg p-2",
                  selectedRole === 'legal_officer' ? "bg-accent/20" : "bg-muted"
                )}>
                  <User className={cn(
                    "h-6 w-6",
                    selectedRole === 'legal_officer' ? "text-accent-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Legal Officer</p>
                  <p className="text-xs text-muted-foreground">Limited access</p>
                </div>
              </button>
            </div>
          </div>

          {/* Demo User Info */}
          <div className="mb-6 rounded-lg bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Demo Account</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {selectedRole === 'admin' ? 'Barr. Adewale Okonkwo' : 'Barr. Chioma Eze'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>•••••••••</span>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="gold-button flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Lagos State University Legal Unit
            <br />
            Protected under NDPR 2019 guidelines
          </p>
        </div>

        {/* Version */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Version 1.0.0 • © 2024 LASU Legal Unit
        </p>
      </div>
    </div>
  );
}
