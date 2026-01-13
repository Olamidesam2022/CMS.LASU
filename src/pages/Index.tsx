import { useState, useRef } from 'react';
import { User, LitigationCase, AdvisoryRequest, LegalDocument } from '@/types/legal';
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
import { AddCaseDialog } from '@/components/dialogs/AddCaseDialog';
import { AddAdvisoryDialog } from '@/components/dialogs/AddAdvisoryDialog';
import { UploadDocumentDialog } from '@/components/dialogs/UploadDocumentDialog';
import { AddUserDialog } from '@/components/dialogs/AddUserDialog';
import { ViewCaseDialog } from '@/components/dialogs/ViewCaseDialog';
import { ViewAdvisoryDialog } from '@/components/dialogs/ViewAdvisoryDialog';
import { ViewDocumentDialog } from '@/components/dialogs/ViewDocumentDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Dialog states
  const [addCaseOpen, setAddCaseOpen] = useState(false);
  const [addAdvisoryOpen, setAddAdvisoryOpen] = useState(false);
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [viewCaseOpen, setViewCaseOpen] = useState(false);
  const [viewAdvisoryOpen, setViewAdvisoryOpen] = useState(false);
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  
  // Selected items for view dialogs
  const [selectedCase, setSelectedCase] = useState<LitigationCase | null>(null);
  const [selectedAdvisory, setSelectedAdvisory] = useState<AdvisoryRequest | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  // Swipe gestures for mobile sidebar
  useSwipeGesture(mainContentRef, {
    onSwipeRight: () => setSidebarOpen(true),
    onSwipeLeft: () => setSidebarOpen(false),
    threshold: 50,
    edgeThreshold: 40
  });

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

  // View handlers
  const handleViewCase = (caseItem: LitigationCase) => {
    setSelectedCase(caseItem);
    setViewCaseOpen(true);
  };

  const handleEditCase = (caseItem: LitigationCase) => {
    toast.info(`Editing case: ${caseItem.suitNumber}`);
  };

  const handleViewAdvisory = (request: AdvisoryRequest) => {
    setSelectedAdvisory(request);
    setViewAdvisoryOpen(true);
  };

  const handleViewDocument = (doc: LegalDocument) => {
    setSelectedDocument(doc);
    setViewDocumentOpen(true);
  };

  const handleDownloadDocument = (doc: LegalDocument) => {
    toast.success(`Downloading: ${doc.name}`);
  };

  const handleEditUser = (user: User) => {
    toast.info(`Editing user: ${user.name}`);
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
            onNavigate={setActiveView}
          />
        );
      case 'litigation':
        return (
          <LitigationRegistry 
            cases={mockCases}
            onAddCase={() => setAddCaseOpen(true)}
            onViewCase={handleViewCase}
            onEditCase={handleEditCase}
          />
        );
      case 'advisory':
        return (
          <AdvisoryWorkflow 
            requests={mockAdvisoryRequests}
            onAddRequest={() => setAddAdvisoryOpen(true)}
            onViewRequest={handleViewAdvisory}
          />
        );
      case 'documents':
        return (
          <DocumentVault 
            documents={mockDocuments}
            onUpload={() => setUploadDocumentOpen(true)}
            onViewDocument={handleViewDocument}
            onDownloadDocument={handleDownloadDocument}
          />
        );
      case 'audit':
        return <AuditTrail logs={mockAuditLogs} />;
      case 'users':
        return (
          <UserManagement 
            users={mockUsers}
            currentUser={currentUser}
            onAddUser={() => setAddUserOpen(true)}
            onEditUser={handleEditUser}
          />
        );
      case 'settings':
        return <Settings currentUser={currentUser} />;
      case 'calendar':
        return (
          <CalendarView 
            cases={mockCases}
            onViewCase={handleViewCase}
          />
        );
      default:
        return <Dashboard 
          metrics={mockMetrics}
          cases={mockCases}
          advisoryRequests={mockAdvisoryRequests}
          auditLogs={mockAuditLogs}
          onNavigate={setActiveView}
        />;
    }
  };

  return (
    <div 
      ref={mainContentRef}
      className="flex h-screen w-screen overflow-hidden bg-background touch-pan-y"
    >
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={cn(
        "flex flex-1 flex-col h-full transition-all duration-300 overflow-hidden",
        "ml-0 md:ml-20 lg:ml-72" // No margin on mobile, sidebar is an overlay
      )}>
        <Header 
          currentUser={currentUser}
          title={viewTitles[activeView] || 'Dashboard'}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderView()}
        </main>
      </div>

      {/* Dialogs */}
      <AddCaseDialog open={addCaseOpen} onOpenChange={setAddCaseOpen} />
      <AddAdvisoryDialog open={addAdvisoryOpen} onOpenChange={setAddAdvisoryOpen} />
      <UploadDocumentDialog open={uploadDocumentOpen} onOpenChange={setUploadDocumentOpen} />
      <AddUserDialog open={addUserOpen} onOpenChange={setAddUserOpen} />
      <ViewCaseDialog open={viewCaseOpen} onOpenChange={setViewCaseOpen} caseItem={selectedCase} />
      <ViewAdvisoryDialog open={viewAdvisoryOpen} onOpenChange={setViewAdvisoryOpen} request={selectedAdvisory} />
      <ViewDocumentDialog open={viewDocumentOpen} onOpenChange={setViewDocumentOpen} document={selectedDocument} />
    </div>
  );
};

export default Index;