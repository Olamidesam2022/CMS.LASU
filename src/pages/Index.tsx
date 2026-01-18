import { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  LitigationCase,
  AdvisoryRequest,
  LegalDocument,
  User as LegacyUser,
} from "@/types/legal";
import {
  mockCases,
  mockAdvisoryRequests,
  mockDocuments,
  mockAuditLogs,
  mockMetrics,
} from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { LitigationRegistry } from "@/components/litigation/LitigationRegistry";
import { AdvisoryWorkflow } from "@/components/advisory/AdvisoryWorkflow";
import { DocumentVault } from "@/components/documents/DocumentVault";
import { AuditTrail } from "@/components/audit/AuditTrail";
import { UserManagement } from "@/components/users/UserManagement";
import { Settings } from "@/components/settings/Settings";
import { CalendarView } from "@/components/calendar/CalendarView";
import { AddCaseDialog } from "@/components/dialogs/AddCaseDialog";
import { AddAdvisoryDialog } from "@/components/dialogs/AddAdvisoryDialog";
import { UploadDocumentDialog } from "@/components/dialogs/UploadDocumentDialog";
import { AddUserDialog } from "@/components/dialogs/AddUserDialog";
import { ViewCaseDialog } from "@/components/dialogs/ViewCaseDialog";
import { ViewAdvisoryDialog } from "@/components/dialogs/ViewAdvisoryDialog";
import { ViewDocumentDialog } from "@/components/dialogs/ViewDocumentDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";
import { Shield } from "lucide-react";

const viewTitles: Record<string, string> = {
  dashboard: "Dashboard",
  litigation: "Litigation Registry",
  advisory: "Advisory Workflow",
  documents: "Document Vault",
  calendar: "Court Calendar",
  audit: "Audit Trail",
  users: "User Management",
  settings: "Settings",
};

const Index = () => {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [dbUsers, setDbUsers] = useState<LegacyUser[]>([]);

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
  const [selectedAdvisory, setSelectedAdvisory] =
    useState<AdvisoryRequest | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<LegalDocument | null>(null);

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      // Use the database function that bypasses RLS
      const { data: usersData, error } = await supabase.rpc("get_all_users");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Transform the data to match LegacyUser format
      const usersWithRoles: LegacyUser[] = (usersData || []).map((u: any) => ({
        id: u.user_id,
        name: u.full_name,
        email: u.email,
        role: (u.role as "admin" | "legal_officer") || "legal_officer",
        department: u.department || "Legal",
        avatar: u.avatar_url || undefined,
      }));

      setDbUsers(usersWithRoles);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
    }
  };

  useEffect(() => {
    if (user && role === "admin") {
      fetchUsers();
    }
  }, [user, role]);

  // Swipe gestures for mobile sidebar
  useSwipeGesture(mainContentRef, {
    onSwipeRight: () => setSidebarOpen(true),
    onSwipeLeft: () => setSidebarOpen(false),
    threshold: 50,
    edgeThreshold: 40,
  });

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    toast.info("You have been logged out");
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

  const handleEditUser = (legacyUser: LegacyUser) => {
    toast.info(`Editing user: ${legacyUser.name}`);
  };

  const handleDeleteUser = async (legacyUser: LegacyUser) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${legacyUser.name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc("delete_user_admin", {
        p_user_id: legacyUser.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("User deleted successfully", {
        description: `${legacyUser.name} has been removed from the system.`,
      });

      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user", {
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Shield className="h-9 w-9 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Create a compatible user object for components that expect the legacy User type
  const currentUser: LegacyUser = {
    id: user.id,
    name: profile?.full_name || user.email || "User",
    email: profile?.email || user.email || "",
    role: role || "legal_officer",
    department: profile?.department || "Legal",
    avatar: profile?.avatar_url || undefined,
  };

  // Render the current view
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            metrics={mockMetrics}
            cases={mockCases}
            advisoryRequests={mockAdvisoryRequests}
            auditLogs={mockAuditLogs}
            onNavigate={setActiveView}
          />
        );
      case "litigation":
        return (
          <LitigationRegistry
            cases={mockCases}
            onAddCase={() => setAddCaseOpen(true)}
            onViewCase={handleViewCase}
            onEditCase={handleEditCase}
          />
        );
      case "advisory":
        return (
          <AdvisoryWorkflow
            requests={mockAdvisoryRequests}
            onAddRequest={() => setAddAdvisoryOpen(true)}
            onViewRequest={handleViewAdvisory}
          />
        );
      case "documents":
        return (
          <DocumentVault
            documents={mockDocuments}
            onUpload={() => setUploadDocumentOpen(true)}
            onViewDocument={handleViewDocument}
            onDownloadDocument={handleDownloadDocument}
          />
        );
      case "audit":
        return <AuditTrail logs={mockAuditLogs} />;
      case "users":
        return (
          <UserManagement
            users={dbUsers}
            currentUser={currentUser}
            onAddUser={() => setAddUserOpen(true)}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case "settings":
        return <Settings currentUser={currentUser} />;
      case "calendar":
        return <CalendarView cases={mockCases} onViewCase={handleViewCase} />;
      default:
        return (
          <Dashboard
            metrics={mockMetrics}
            cases={mockCases}
            advisoryRequests={mockAdvisoryRequests}
            auditLogs={mockAuditLogs}
            onNavigate={setActiveView}
          />
        );
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
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-1 flex-col h-full transition-all duration-300 overflow-hidden",
          // Dynamic margin based on sidebar state
          "ml-0", // No margin on mobile (sidebar is overlay)
          sidebarCollapsed ? "md:ml-20" : "md:ml-72", // 80px when collapsed, 288px when expanded
        )}
      >
        <Header
          currentUser={currentUser}
          title={viewTitles[activeView] || "Dashboard"}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderView()}
        </main>
      </div>

      {/* Dialogs */}
      <AddCaseDialog open={addCaseOpen} onOpenChange={setAddCaseOpen} />
      <AddAdvisoryDialog
        open={addAdvisoryOpen}
        onOpenChange={setAddAdvisoryOpen}
      />
      <UploadDocumentDialog
        open={uploadDocumentOpen}
        onOpenChange={setUploadDocumentOpen}
      />
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onUserCreated={fetchUsers}
      />
      <ViewCaseDialog
        open={viewCaseOpen}
        onOpenChange={setViewCaseOpen}
        caseItem={selectedCase}
      />
      <ViewAdvisoryDialog
        open={viewAdvisoryOpen}
        onOpenChange={setViewAdvisoryOpen}
        request={selectedAdvisory}
      />
      <ViewDocumentDialog
        open={viewDocumentOpen}
        onOpenChange={setViewDocumentOpen}
        document={selectedDocument}
      />
    </div>
  );
};

export default Index;
