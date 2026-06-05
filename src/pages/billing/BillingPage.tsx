import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, DollarSign, Clock, AlertTriangle, RotateCcw, Eye, X, LucideLoader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import { useDashboardStats, useInvoices } from "../../api/hooks";
import type { Invoice } from "../../api/types";
import { getCurrencySymbol, sumInvoicesByCurrency } from "../../lib/currency";

type StatusFilter = "all" | "paid" | "pending" | "overdue" | "refunded";

export default function BillingPage() {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [selected, setSelected] = useState<string | null>(invoiceId ?? null);

    const { data: invoicesData, isLoading } = useInvoices();
    const { data: dashboardStats } = useDashboardStats();
    const invoices: Invoice[] = invoicesData ?? [];

    const filtered = invoices.filter((inv) => {
        const matchSearch =
            (inv.companyName ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (inv.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
            inv.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || inv.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const detail = selected ? invoices.find((i) => i.id === selected) : null;

    const closeDetail = () => {
        setSelected(null);
        if (invoiceId) navigate("/admin/billing");
    };

    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const pendingInvoices = invoices.filter((i) => i.status === "pending");
    const overdueInvoices = invoices.filter((i) => i.status === "overdue");
    const refundedInvoices = invoices.filter((i) => i.status === "refunded");

    const paidByCurrency = sumInvoicesByCurrency(paidInvoices);
    const pendingByCurrency = sumInvoicesByCurrency(pendingInvoices);
    const overdueByCurrency = sumInvoicesByCurrency(overdueInvoices);
    const refundedByCurrency = sumInvoicesByCurrency(refundedInvoices);

    const baseCur = dashboardStats?.revenueBaseCurrency ?? "USD";
    const revSym = getCurrencySymbol(baseCur);
    const reportingPaid =
        dashboardStats?.revenueOverview != null ?
            `${revSym}${dashboardStats.revenueOverview.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        :   null;

    function breakdownValue(m: Map<string, number>) {
        if (m.size === 0) {
            return "—";
        }
        return (
            <div className="flex flex-col gap-1 text-xl sm:text-2xl font-bold leading-tight font-serif">
                {Array.from(m.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([c, total]) => (
                        <span key={c} className="tabular-nums text-heading">
                            {getCurrencySymbol(c)}
                            {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            <span className="text-sm font-normal text-muted ml-1.5">{c}</span>
                        </span>
                    ))}
            </div>
        );
    }

    const summaryCards = [
        {
            label: "Total revenue (paid)",
            value: breakdownValue(paidByCurrency),
            detail:
                reportingPaid ?
                    <>Reporting total ({baseCur}): {reportingPaid}</>
                :   "Set exchange rates in System settings for a single reporting total.",
            icon: <DollarSign className="w-4 h-4" />,
            iconClassName: "bg-success/10 text-success",
        },
        {
            label: "Pending",
            value: breakdownValue(pendingByCurrency),
            detail: "Shown in original invoice currencies",
            icon: <Clock className="w-4 h-4" />,
            iconClassName: "bg-warning/10 text-warning",
        },
        {
            label: "Overdue",
            value: breakdownValue(overdueByCurrency),
            detail: "Shown in original invoice currencies",
            icon: <AlertTriangle className="w-4 h-4" />,
            iconClassName: "bg-danger/10 text-danger",
        },
        {
            label: "Refunded",
            value: breakdownValue(refundedByCurrency),
            detail: "Shown in original invoice currencies",
            icon: <RotateCcw className="w-4 h-4" />,
            iconClassName: "bg-info/10 text-info",
        },
    ];

    const statusColors: Record<string, string> = {
        paid: "bg-success/10 text-success",
        pending: "bg-warning/10 text-warning",
        overdue: "bg-danger/10 text-danger",
        refunded: "bg-info/10 text-info",
    };

    return (
        <div className="space-y-8 lg:space-y-10">
            <PageHeader
                title="Billing & Invoices"
                description="Manage invoices and track payments."
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by organization, user or invoice ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    {(["all", "paid", "pending", "overdue", "refunded"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors",
                                statusFilter === f ? "bg-accent text-white" : "bg-button-secondary border border-border text-body hover:bg-background-secondary"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border-light/50 overflow-x-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-muted">No invoices found</div>
                ) : (
                    <table className="w-full text-sm min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Invoice ID</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Organization / User</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Amount</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Status</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Description</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Issued</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Due Date</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Payment</th>
                                <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((inv) => {
                                const sym = getCurrencySymbol(inv.currency);
                                return (
                                    <tr key={inv.id} className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150">
                                        <td className="p-4 text-heading font-medium text-xs">{inv.id}</td>
                                        <td className="p-4">
                                            <p className="text-heading font-medium">{inv.companyName ?? inv.userName ?? "—"}</p>
                                            {inv.companyName && inv.userName && <p className="text-[11px] text-muted">{inv.userName}</p>}
                                        </td>
                                        <td className="p-4 text-heading font-bold">{sym}{inv.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={cn("px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize", statusColors[inv.status])}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted text-xs max-w-[180px] truncate">{inv.description}</td>
                                        <td className="p-4 text-muted text-xs whitespace-nowrap">{inv.issuedAt}</td>
                                        <td className="p-4 text-muted text-xs whitespace-nowrap">{inv.dueDate}</td>
                                        <td className="p-4 text-muted text-xs">{inv.paymentMethod ?? "—"}</td>
                                        <td className="p-4">
                                            <button onClick={() => setSelected(inv.id)} className="p-1.5 rounded-xl hover:bg-background-secondary text-muted hover:text-heading">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail modal */}
            {detail && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
                    <div className="bg-white rounded-2xl border border-border-light/50 w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-heading">Invoice Detail</h2>
                            <button onClick={closeDetail} className="text-muted hover:text-heading"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            {([
                                ["Invoice ID", detail.id],
                                ["Organization", detail.companyName ?? "—"],
                                ["User", detail.userName ?? "—"],
                                ["Amount", `${getCurrencySymbol(detail.currency)}${detail.amount.toLocaleString()}`],
                                ["Currency", detail.currency ?? "NGN"],
                                ["Status", detail.status],
                                ["Description", detail.description],
                                ["Issued At", detail.issuedAt],
                                ["Due Date", detail.dueDate],
                                ["Paid At", detail.paidAt ?? "—"],
                                ["Payment Method", detail.paymentMethod ?? "—"],
                            ] as const).map(([label, value]) => (
                                <div key={label} className="flex justify-between border-b border-border-light/50 pb-2">
                                    <span className="text-muted">{label}</span>
                                    <span className="text-heading font-medium capitalize">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
