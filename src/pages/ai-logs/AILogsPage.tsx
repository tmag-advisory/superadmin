import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Eye, X, Activity, CheckCircle, XCircle, AlertTriangle, LucideLoader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import { useAILogs } from "../../api/hooks";
import type { AIRequestLog } from "../../api/types";

type FilterTab = "all" | "failures" | "flagged" | "high-usage";

const TAB_CONFIG: { key: FilterTab; label: string; path: string }[] = [
  { key: "all", label: "All", path: "/admin/ai-logs" },
  { key: "failures", label: "Failures", path: "/admin/ai-logs/failures" },
  { key: "flagged", label: "Flagged", path: "/admin/ai-logs/flagged" },
  { key: "high-usage", label: "High Usage", path: "/admin/ai-logs/high-usage" },
];

export default function AILogsPage() {
  const { data: aiLogsData, isLoading } = useAILogs();
  const aiLogs: AIRequestLog[] = aiLogsData ?? [];

  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const activeTab: FilterTab = (() => {
    const path = location.pathname;
    if (path.endsWith("/failures")) return "failures";
    if (path.endsWith("/flagged")) return "flagged";
    if (path.endsWith("/high-usage")) return "high-usage";
    return "all";
  })();


  const filtered = aiLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.destination.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === "failures") return log.status === "error";
    if (activeTab === "flagged") return log.status === "flagged";
    if (activeTab === "high-usage") return log.tokensUsed > 3000;
    return true;
  });

  const detail = selected && filtered.find((l) => l.id === selected)
    ? aiLogs.find((l) => l.id === selected)
    : null;

  const summaryCards = [
    {
      label: "Total Requests",
      value: aiLogs.length,
      icon: <Activity className="w-4 h-4" />,
      iconClassName: "bg-accent/10 text-accent",
    },
    {
      label: "Successful",
      value: aiLogs.filter((l) => l.status === "success").length,
      icon: <CheckCircle className="w-4 h-4" />,
      iconClassName: "bg-success/10 text-success",
    },
    {
      label: "Failed",
      value: aiLogs.filter((l) => l.status === "error").length,
      icon: <XCircle className="w-4 h-4" />,
      iconClassName: "bg-danger/10 text-danger",
    },
    {
      label: "Flagged",
      value: aiLogs.filter((l) => l.status === "flagged").length,
      icon: <AlertTriangle className="w-4 h-4" />,
      iconClassName: "bg-warning/10 text-warning",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <PageHeader
        title="AI Request Logs"
        description="Monitor AI processing requests for debugging and compliance."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {summaryCards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconClassName={s.iconClassName}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                activeTab === tab.key ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">User</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Destination</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Risk</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Plan Tokens</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Summary Tokens</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Total Tokens</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Time (ms)</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Model</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Timestamp</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150">
                <td className="p-4">
                  <p className="text-heading font-medium">{log.userName}</p>
                  <p className="text-[11px] text-muted">{log.companyName ?? "Individual"}</p>
                </td>
                <td className="p-4 text-body">{log.destination}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                    log.status === "success" && "bg-success/10 text-success",
                    log.status === "error" && "bg-danger/10 text-danger",
                    log.status === "flagged" && "bg-warning/10 text-warning"
                  )}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                    log.riskLevel === "low" && "bg-success/10 text-success",
                    log.riskLevel === "medium" && "bg-warning/10 text-warning",
                    log.riskLevel === "high" && "bg-danger/10 text-danger"
                  )}>
                    {log.riskLevel}
                  </span>
                </td>
                <td className="p-4 text-body">{(log.planGenerationTokensUsed ?? 0).toLocaleString()}</td>
                <td className="p-4 text-body">{(log.summaryGenerationTokensUsed ?? 0).toLocaleString()}</td>
                <td className="p-4 text-body">{log.tokensUsed.toLocaleString()}</td>
                <td className="p-4 text-body">{log.processingTimeMs.toLocaleString()}</td>
                <td className="p-4 text-muted text-xs">{log.modelUsed}</td>
                <td className="p-4 text-muted text-xs whitespace-nowrap">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                <td className="p-4">
                  <button onClick={() => setSelected(log.id)} className="p-1.5 rounded-xl hover:bg-background-secondary text-muted hover:text-heading">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="p-8 text-center text-muted text-sm">
                  No AI logs found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-heading">Request Detail</h2>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["User", detail.userName],
                ["Organization", detail.companyName ?? "—"],
                ["Destination", detail.destination],
                ["Status", detail.status],
                ["Risk Level", detail.riskLevel],
                ["Model", detail.modelUsed],
                ["Plan Generation Tokens", (detail.planGenerationTokensUsed ?? 0).toLocaleString()],
                ["Summary Generation Tokens", (detail.summaryGenerationTokensUsed ?? 0).toLocaleString()],
                ["Total Tokens Used", detail.tokensUsed.toLocaleString()],
                ["Processing Time", `${detail.processingTimeMs}ms`],
                ["Credit Consumed", detail.creditConsumed ? "Yes" : "No"],
                ["Timestamp", detail.timestamp ? new Date(detail.timestamp).toLocaleString() : "—"],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-heading font-medium">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-muted mb-1">Prompt Summary</p>
                <p className="text-body bg-background-primary rounded-xl p-3">{detail.promptSummary}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Output Summary</p>
                <p className="text-body bg-background-primary rounded-xl p-3">{detail.outputSummary || "No output (error)"}</p>
              </div>
              {detail.errorMessage && (
                <div>
                  <p className="text-danger mb-1">Error</p>
                  <p className="text-danger/80 bg-danger/5 rounded-xl p-3 text-xs">{detail.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
