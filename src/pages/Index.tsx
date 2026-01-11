import { useState, useEffect } from 'react';
import { User } from '@/types/legal';
import { 
  mockCases, 
  mockAdvisoryRequests, 
  mockDocuments, 
  mockAuditLogs, 
  mockMetrics,
  mockUsers 
} from '@/data/mockData';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { LitigationRegistry } from '@/components/litigation/LitigationRegistry';
import { AdvisoryWorkflow } from '@/components/advisory/AdvisoryWorkflow';
import { DocumentVault } from '@/components/documents/DocumentVault';
import { AuditTrail } from '@/components/audit/AuditTrail';
import { UserManagement } from '@/components/users/UserManagement';
import { Settings } from '@/components/settings/Settings';
import { CalendarView } from '@/components/calendar/CalendarView';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  litigation: 'Litigation Registry',
  advisory: 'Advisory Workflow',
  documents: 'Document Vault',
  calendar: 'Court Calendar',
  audit: 'Audit Trail',
  users: 'User Management',
  settings: 'Settings',
};

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    toast.success(`Welcome, ${user.name}`, {
      description: `Logged in as ${user.role === 'admin' ? 'Administrator' : 'Legal Officer'}`,
    });
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
    toast.info('You have been logged out');
  };

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Render the current view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            metrics={mockMetrics}
            cases={mockCases}
            advisoryRequests={mockAdvisoryRequests}
            auditLogs={mockAuditLogs}
          />
        );
      case 'litigation':
        return (
          <LitigationRegistry 
            cases={mockCases}
            onAddCase={() => toast.info('Add Case dialog would open here')}
            onViewCase={(c) => toast.info(`Viewing case: ${c.suitNumber}`)}
            onEditCase={(c) => toast.info(`Editing case: ${c.suitNumber}`)}
          />
        );
      case 'advisory':
        return (
          <AdvisoryWorkflow 
            requests={mockAdvisoryRequests}
            onAddRequest={() => toast.info('Add Request dialog would open here')}
            onViewRequest={(r) => toast.info(`Viewing request: ${r.requestNumber}`)}
          />
        );
      case 'documents':
        return (
          <DocumentVault 
            documents={mockDocuments}
            onUpload={() => toast.info('Upload dialog would open here')}
            onViewDocument={(d) => toast.info(`Viewing document: ${d.name}`)}
            onDownloadDocument={(d) => toast.success(`Downloading: ${d.name}`)}
          />
        );
      case 'audit':
        return <AuditTrail logs={mockAuditLogs} />;
      case 'users':
        return (
          <UserManagement 
            users={mockUsers}
            currentUser={currentUser}
            onAddUser={() => toast.info('Add User dialog would open here')}
            onEditUser={(u) => toast.info(`Editing user: ${u.name}`)}
          />
        );
      case 'settings':
        return <Settings currentUser={currentUser} />;
      case 'calendar':
        return (
          <CalendarView 
            cases={mockCases}
            onViewCase={(c) => toast.info(`Viewing case: ${c.suitNumber}`)}
          />
        );
      default:
        return <Dashboard 
          metrics={mockMetrics}
          cases={mockCases}
          advisoryRequests={mockAdvisoryRequests}
          auditLogs={mockAuditLogs}
        />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        "ml-20 md:ml-72" // Adjust for sidebar width
      )}>
        <Header 
          currentUser={currentUser}
          title={viewTitles[activeView] || 'Dashboard'}
        />
        <div className="min-h-[calc(100vh-4rem)]">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
