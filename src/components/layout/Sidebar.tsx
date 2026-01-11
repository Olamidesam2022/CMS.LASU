import { useState } from 'react';
import { 
  LayoutDashboard, 
  Scale, 
  FileText, 
  FolderOpen, 
  Users, 
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  CalendarDays
} from 'lucide-react';
import { User, UserRole } from '@/types/legal';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentUser: User;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'legal_officer'] },
  { id: 'litigation', label: 'Litigation Registry', icon: Scale, roles: ['admin', 'legal_officer'] },
  { id: 'advisory', label: 'Advisory Workflow', icon: FileText, roles: ['admin', 'legal_officer'] },
  { id: 'documents', label: 'Document Vault', icon: FolderOpen, roles: ['admin', 'legal_officer'] },
  { id: 'calendar', label: 'Court Calendar', icon: CalendarDays, roles: ['admin', 'legal_officer'] },
  { id: 'audit', label: 'Audit Trail', icon: ClipboardList, roles: ['admin'] },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'legal_officer'] },
];

export function Sidebar({ currentUser, activeView, onViewChange, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside 
      className={cn(
        "glass-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Shield className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">LASU Legal</h1>
              <p className="text-xs text-sidebar-foreground/60">Case Management</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "nav-item w-full",
                    isActive && "active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        {/* User Info */}
        <div className={cn(
          "mb-4 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3",
          collapsed && "justify-center"
        )}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {currentUser.role === 'admin' ? 'Administrator' : 'Legal Officer'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
          <button
            onClick={onLogout}
            className={cn(
              "nav-item w-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
              collapsed && "justify-center"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
