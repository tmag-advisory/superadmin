import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Plus,
  Building2,
  Users,
  FileText,
  ShieldCheck,
  CalendarClock,
  LucideLoader2,
  X,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import { useCompanies, useCreateCompany } from "../../api/hooks";
import type { Company } from "../../api/types";

type BillingFilter = "all" | "active" | "frozen";

const emptyForm = { name: "", industry: "", contactEmail: "", contactPhone: "", website: "", address: "", billingCurrency: "NGN" as "USD" | "NGN" | "EUR" | "GBP", adminFirstName: "", adminLastName: "", adminEmail: "", adminPassword: "" };

export default function CompaniesPage() {
  const { data: companiesData, isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const companies: Company[] = companiesData ?? [];

  const [search, setSearch] = useState("");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);

  const filtered = companies.filter((c) => {
    const matchesSearch = c.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesBilling =
      billingFilter === "all" || c.billingStatus === billingFilter;
    return matchesSearch && matchesBilling;
  });

  const activeCount = companies.filter(
    (c) => c.billingStatus === "active"
  ).length;
  const frozenCount = companies.filter(
    (c) => c.billingStatus === "frozen"
  ).length;

  const summaryStats = [
    {
      label: "Total Organizations",
      value: companies.length,
      icon: <Building2 className="w-4 h-4" />,
      iconClassName: "bg-accent/10 text-accent",
    },
    {
      label: "Active",
      value: activeCount,
      icon: <ShieldCheck className="w-4 h-4" />,
      iconClassName: "bg-success/10 text-success",
    },
    {
      label: "Frozen",
      value: frozenCount,
      icon: <Building2 className="w-4 h-4" />,
      iconClassName: "bg-danger/10 text-danger",
    },
  ];

  const billingOptions: { key: BillingFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "frozen", label: "Frozen" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization Management"
        description="Corporate accounts, billing status, and credit usage."
        badge={
          <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent">
            {companies.length} organizations
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark text-background-primary rounded-xl text-sm font-semibold hover:bg-darkest transition-colors duration-200"
          >
            <Plus className="w-4 h-4" /> Add Organization
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s) => (
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
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
          />
        </div>
        <div className="flex gap-1 bg-background-secondary rounded-xl p-1">
          {billingOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setBillingFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150",
                billingFilter === opt.key
                  ? "bg-white text-heading"
                  : "text-muted hover:text-heading"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((company) => {
          const creditPercent =
            company.creditsPurchased > 0
              ? Math.round(
                  (company.creditsRemaining / company.creditsPurchased) * 100
                )
              : 0;
          return (
            <div
              key={company.id}
              className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-heading">
                      {company.name}
                    </h3>
                    <p className="text-xs text-muted">{company.industry || "N/A"}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                      company.tier === "enterprise"
                        ? "bg-gold/10 text-gold"
                        : "bg-button-secondary text-body"
                    )}
                  >
                    {company.tier}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                      company.billingStatus === "active" &&
                        "bg-success/10 text-success",
                      company.billingStatus === "frozen" &&
                        "bg-danger/10 text-danger"
                    )}
                  >
                    {company.billingStatus}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted">Credits</span>
                  <span className="text-heading font-medium">
                    {company.creditsRemaining} / {company.creditsPurchased}
                  </span>
                </div>
                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      creditPercent > 30
                        ? "bg-accent"
                        : creditPercent > 10
                          ? "bg-warning"
                          : "bg-danger"
                    )}
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background-secondary rounded-xl p-2">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Users className="w-3 h-3 text-muted" />
                  </div>
                  <p className="text-sm font-serif text-heading tabular-nums">
                    {company.activeEmployees ?? 0}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Employees</p>
                </div>
                <div className="bg-background-secondary rounded-xl p-2">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <FileText className="w-3 h-3 text-muted" />
                  </div>
                  <p className="text-sm font-serif text-heading tabular-nums">
                    {company.plansGenerated ?? 0}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Plans</p>
                </div>
                <div className="bg-background-secondary rounded-xl p-2">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <ShieldCheck className="w-3 h-3 text-muted" />
                  </div>
                  <p className="text-sm font-serif text-heading tabular-nums">
                    {company.hrAdmins?.length ?? 0}
                  </p>
                  <p className="text-[10px] text-muted uppercase">HR Admins</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted">
                <CalendarClock className="w-3.5 h-3.5" />
                Renewal: {company.contractRenewal ? new Date(company.contractRenewal).toLocaleDateString() : "N/A"}
              </div>

              <Link
                to={`/admin/companies/${company.id}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-button-secondary hover:bg-background-primary rounded-xl text-sm font-medium text-heading transition-colors duration-150"
              >
                <Eye className="w-4 h-4" /> View Details
              </Link>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-sm text-muted">No organizations match your search.</p>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-heading">Add Organization</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {([
                { field: "name", label: "Organization Name *", type: "text", placeholder: "" },
                { field: "industry", label: "Industry", type: "text", placeholder: "e.g. Finance, Healthcare" },
                { field: "contactEmail", label: "Contact Email", type: "email", placeholder: "" },
                { field: "contactPhone", label: "Contact Phone", type: "tel", placeholder: "Optional" },
                { field: "website", label: "Website", type: "text", placeholder: "Optional" },
                { field: "address", label: "Address", type: "text", placeholder: "Optional" },
              ] as const).map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs text-muted mb-1">{label}</label>
                  <input
                    type={type}
                    value={createForm[field]}
                    onChange={(e) => setCreateForm({ ...createForm, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted mb-1">Billing Currency</label>
                <select
                  value={createForm.billingCurrency}
                  onChange={(e) => setCreateForm({ ...createForm, billingCurrency: e.target.value as "USD" | "NGN" | "EUR" | "GBP" })}
                  className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>

              <div className="pt-2 border-t border-border-light/50">
                <p className="text-xs font-semibold text-heading mb-3">Default HR Admin Account</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="mb-3">
                    <label className="block text-xs text-muted mb-1">Admin First Name</label>
                    <input
                      type="text"
                      value={createForm.adminFirstName}
                      onChange={(e) => setCreateForm({ ...createForm, adminFirstName: e.target.value })}
                      placeholder=""
                      className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs text-muted mb-1">Admin Last Name</label>
                    <input
                      type="text"
                      value={createForm.adminLastName}
                      onChange={(e) => setCreateForm({ ...createForm, adminLastName: e.target.value })}
                      placeholder=""
                      className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>
                {([
                  { field: "adminEmail" as const, label: "Admin Email *", type: "email", placeholder: "" },
                  { field: "adminPassword" as const, label: "Admin Password *", type: "password", placeholder: "" },
                ]).map(({ field, label, type, placeholder }) => (
                  <div key={field} className="mb-3">
                    <label className="block text-xs text-muted mb-1">{label}</label>
                    <input
                      type={type}
                      value={createForm[field]}
                      onChange={(e) => setCreateForm({ ...createForm, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                ))}
                <p className="text-[11px] text-muted">The admin will be prompted to change their password on first login.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  if (!createForm.name || !createForm.adminEmail || !createForm.adminPassword) return;
                  createMutation.mutate(createForm, {
                    onSuccess: () => {
                      setShowCreate(false);
                      setCreateForm(emptyForm);
                    },
                  });
                }}
                disabled={createMutation.isPending || !createForm.name || !createForm.adminEmail || !createForm.adminPassword}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Organization"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-button-secondary text-body rounded-xl text-sm font-medium hover:bg-background-primary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
