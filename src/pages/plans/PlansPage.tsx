import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Flag, Archive, Trash2, X, FileText, ShieldAlert, AlertTriangle, CheckCircle, LucideLoader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import { useGeneratedPlans, useFlagPlan, useArchivePlan, useDeletePlan } from "../../api/hooks";
import type { GeneratedPlan } from "../../api/types";

export default function PlansPage() {
  const { data: plansData, isLoading } = useGeneratedPlans();
  const flagMutation = useFlagPlan();
  const archiveMutation = useArchivePlan();
  const deleteMutation = useDeletePlan();

  const plans: GeneratedPlan[] = (plansData ?? []).filter((p: GeneratedPlan) => p.status !== "deleted");

  const { planId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(planId ?? null);

  const filtered = plans.filter((p) => {
    const matchSearch =
      p.userName.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const detail = selected ? plans.find((p) => p.id === selected) : null;

  const closeDetail = () => {
    setSelected(null);
    if (planId) navigate("/admin/plans");
  };

  const summaryCards = [
    {
      label: "Total Plans",
      value: plans.length,
      icon: <FileText className="w-4 h-4" />,
      iconClassName: "bg-accent/10 text-accent",
    },
    {
      label: "Active",
      value: plans.filter((p) => p.status === "active").length,
      icon: <CheckCircle className="w-4 h-4" />,
      iconClassName: "bg-success/10 text-success",
    },
    {
      label: "Flagged",
      value: plans.filter((p) => p.status === "flagged").length,
      icon: <AlertTriangle className="w-4 h-4" />,
      iconClassName: "bg-warning/10 text-warning",
    },
    {
      label: "Archived",
      value: plans.filter((p) => p.status === "archived").length,
      icon: <Archive className="w-4 h-4" />,
      iconClassName: "bg-info/10 text-info",
    },
    {
      label: "Processing",
      value: plans.filter((p) => p.status === "processing").length,
      icon: <LucideLoader2 className="w-4 h-4" />,
      iconClassName: "bg-accent/10 text-accent",
    },
    {
      label: "High Risk",
      value: plans.filter((p) => p.riskScore >= 60).length,
      icon: <ShieldAlert className="w-4 h-4" />,
      iconClassName: "bg-danger/10 text-danger",
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
        title="User-generated plans"
        description="Plans are created from the client dashboard (and HR create-plan). This view is read-only oversight: review, flag, archive, or remove records."
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
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
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          {(["all", "active", "processing", "failed", "flagged", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors",
                statusFilter === f ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
              )}
            >
              {f}
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
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Duration</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Purpose</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Risk Score</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Vaccines</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Created</th>
              <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((plan) => (
              <tr key={plan.id} className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150">
                <td className="p-4 text-heading font-medium">{plan.userName}</td>
                <td className="p-4 text-body">{plan.destination}</td>
                <td className="p-4 text-body">{plan.duration}</td>
                <td className="p-4 text-muted text-xs">{plan.purpose}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                    plan.riskScore < 30 ? "bg-success/10 text-success" : plan.riskScore < 60 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                  )}>
                    {plan.riskScore}%
                  </span>
                </td>
                <td className="p-4 text-body text-xs">{plan.vaccinations?.length ?? 0}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                    plan.status === "active" && "bg-success/10 text-success",
                    plan.status === "processing" && "bg-accent/10 text-accent",
                    plan.status === "failed" && "bg-danger/10 text-danger",
                    plan.status === "flagged" && "bg-warning/10 text-warning",
                    plan.status === "archived" && "bg-info/10 text-info"
                  )}>
                    {plan.status}
                  </span>
                </td>
                <td className="p-4 text-muted text-xs">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "—"}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelected(plan.id)} className="p-1.5 rounded-xl hover:bg-background-secondary text-muted hover:text-heading" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {plan.status === "active" && (
                      <button 
                        onClick={() => flagMutation.mutate(plan.id)} 
                        disabled={flagMutation.isPending}
                        className="p-1.5 rounded-xl hover:bg-warning/10 text-muted hover:text-warning disabled:opacity-50" 
                        title="Flag"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {plan.status !== "archived" && (
                      <button 
                        onClick={() => archiveMutation.mutate(plan.id)}
                        disabled={archiveMutation.isPending}
                        className="p-1.5 rounded-xl hover:bg-info/10 text-muted hover:text-info disabled:opacity-50" 
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteMutation.mutate(plan.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-xl hover:bg-danger/10 text-muted hover:text-danger disabled:opacity-50" 
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted text-sm">
                  No plans found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-heading">Plan Detail</h2>
              <button onClick={closeDetail} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {([
                ["Plan ID", detail.id],
                ["User", detail.userName],
                ["Organization", detail.companyName ?? "Individual"],
                ["Destination", detail.destination],
                ["Duration", detail.duration],
                ["Purpose", detail.purpose],
                ["Risk Score", `${detail.riskScore}%`],
                ["Status", detail.status],
                ["Credit Used", detail.creditUsed ? "Yes" : "No"],
                ["Created", detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : "—"],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                  <span className="text-muted">{label}</span>
                  <span className="text-heading font-medium capitalize">{value}</span>
                </div>
              ))}
              <div>
                <p className="text-muted mb-2">Vaccinations</p>
                <div className="flex flex-wrap gap-1.5">
                  {(detail.vaccinations ?? []).map((v) => (
                    <span key={v} className="px-2.5 py-1 rounded-xl text-xs font-medium bg-accent/10 text-accent">{v}</span>
                  ))}
                  {(detail.vaccinations ?? []).length === 0 && (
                    <span className="text-xs text-muted">None required</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted mb-2">Health Alerts</p>
                <div className="space-y-1.5">
                  {(detail.healthAlerts ?? []).map((a, i) => (
                    <p key={i} className="text-body bg-warning/5 rounded-xl p-2 text-xs">{a}</p>
                  ))}
                  {(detail.healthAlerts ?? []).length === 0 && (
                    <span className="text-xs text-muted">None</span>
                  )}
                </div>
              </div>
              {(detail.safetyAdvisories ?? []).length > 0 && (
                <div>
                  <p className="text-muted mb-2">Safety Advisories</p>
                  <div className="space-y-1.5">
                    {detail.safetyAdvisories.map((a, i) => (
                      <p key={i} className="text-body bg-danger/5 rounded-xl p-2 text-xs">{a}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}