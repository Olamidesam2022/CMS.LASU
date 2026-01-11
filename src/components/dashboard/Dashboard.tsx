import { Scale, FileText, AlertTriangle, TrendingUp, Briefcase, Clock } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { RiskMonitor } from './RiskMonitor';
import { RecentActivity } from './RecentActivity';
import { LitigationCase, AdvisoryRequest, AuditLog, DashboardMetrics } from '@/types/legal';

interface DashboardProps {
  metrics: DashboardMetrics;
  cases: LitigationCase[];
  advisoryRequests: AdvisoryRequest[];
  auditLogs: AuditLog[];
}

export function Dashboard({ metrics, cases, advisoryRequests, auditLogs }: DashboardProps) {
  const pendingAdvisory = advisoryRequests.filter(r => r.status === 'Pending' || r.status === 'Urgent').length;
  const urgentAdvisory = advisoryRequests.filter(r => r.status === 'Urgent').length;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Litigation"
          value={metrics.activeLitigation}
          subtitle={`${metrics.totalCases} total cases`}
          icon={Scale}
          variant="default"
        />
        <MetricCard
          title="Advisory Backlog"
          value={metrics.advisoryBacklog}
          subtitle={`${urgentAdvisory} urgent requests`}
          icon={FileText}
          variant="warning"
        />
        <MetricCard
          title="Urgent Hearings"
          value={metrics.urgentHearings}
          subtitle="Within 72 hours"
          icon={AlertTriangle}
          variant="warning"
        />
        <MetricCard
          title="Win Rate"
          value={`${metrics.winRate}%`}
          subtitle="Last 12 months"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          variant="success"
        />
      </div>

      {/* Risk Monitor */}
      <RiskMonitor cases={cases} />

      {/* Two Column Layout */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Upcoming Hearings */}
        <div className="lg:col-span-2 overflow-hidden">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Upcoming Hearings</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Next 7 days schedule</p>
                </div>
                <button className="rounded-lg bg-muted px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-muted/80 whitespace-nowrap flex-shrink-0">
                  View Calendar
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {cases
                .filter(c => c.nextHearing > new Date())
                .sort((a, b) => a.nextHearing.getTime() - b.nextHearing.getTime())
                .slice(0, 4)
                .map((caseItem, index) => (
                  <div 
                    key={caseItem.id} 
                    className="flex items-center gap-3 p-3 sm:p-4 transition-colors hover:bg-muted/30 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10 text-accent-foreground">
                      <span className="text-[10px] sm:text-xs font-medium">
                        {caseItem.nextHearing.toLocaleDateString('en-NG', { month: 'short' })}
                      </span>
                      <span className="text-sm sm:text-lg font-bold">
                        {caseItem.nextHearing.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                          {caseItem.suitNumber}
                        </h4>
                        <span className={`status-pill status-${caseItem.proceduralStage.toLowerCase()}`}>
                          {caseItem.proceduralStage}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {caseItem.caseTitle}
                      </p>
                      <div className="mt-1 flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {caseItem.nextHearing.toLocaleTimeString('en-NG', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="truncate hidden sm:inline">{caseItem.court}</span>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block flex-shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {caseItem.assignedCounsel.split(' ').slice(-1)[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">Counsel</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity logs={auditLogs} />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-info/10 p-2 sm:p-2.5 flex-shrink-0">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingAdvisory}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Pending Advisory Requests</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2 sm:p-2.5 flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-foreground">24</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Documents This Month</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/20 p-2 sm:p-2.5 flex-shrink-0">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-foreground">3</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Cases Closed This Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
