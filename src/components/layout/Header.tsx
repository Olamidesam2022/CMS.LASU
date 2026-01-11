import { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { User } from '@/types/legal';

interface HeaderProps {
  currentUser: User;
  title: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ currentUser, title, onMenuToggle, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-NG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search cases, documents..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input w-64 pl-10"
            />
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              3
            </span>
          </button>

          {/* User Avatar */}
          <div className="hidden items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser.role === 'admin' ? 'Admin' : 'Legal Officer'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
