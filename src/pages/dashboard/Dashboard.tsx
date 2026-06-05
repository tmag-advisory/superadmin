import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    CreditCard,
    Zap,
    DollarSign,
    AlertTriangle,
    Activity,
    TrendingUp,
    Globe,
    ShieldAlert,
    FileWarning,
    ServerCrash,
    UserCheck,
    LucideLoader2,
    FileText,
    Briefcase,
    UserX,
    Receipt,
    Bot,
    ArrowRight,
    Sparkles,
    Percent,
} from "lucide-react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import {
    useDashboardStats,
    useAnalytics,
    useAILogs,
    useAbuseFlags,
    useGeneratedPlans,
    useSystemLogs,
} from "../../api/hooks";
import type {
    DashboardStats,
    AnalyticsData,
    AIRequestLog,
    GeneratedPlan,
    SystemLog,
    AbuseFlag,
} from "../../api/types";

const PIE_COLORS = ["#2a7a6a", "#c4953a"];
const CHART_COLORS = ["#2a7a6a", "#c4953a", "#3b82f6"];

function StatSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-border-light/50 p-4 sm:p-6 animate-pulse flex flex-col gap-3">
            <div className="flex justify-between">
                <div className="h-3 w-24 bg-border-light/50 rounded" />
                <div className="w-8 h-8 rounded-lg bg-border-light/50" />
            </div>
            <div className="h-8 w-28 bg-border-light/50 rounded" />
        </div>
    );
}

function SystemHealthBadge({ status }: { status: string }) {
    const config: Record<
        string,
        { color: string; bg: string; dot: string; label: string }
    > = {
        healthy: {
            color: "text-success",
            bg: "bg-success/10",
            dot: "bg-success",
            label: "All Systems Healthy",
        },
        degraded: {
            color: "text-warning",
            bg: "bg-warning/10",
            dot: "bg-warning",
            label: "Needs Attention",
        },
        down: {
            color: "text-danger",
            bg: "bg-danger/10",
            dot: "bg-danger",
            label: "System Down",
        },
    };
    const c = config[status] ?? config.healthy;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs",
                c.color,
                c.bg,
            )}
        >
            <span className={cn("w-2 h-2 rounded-full animate-pulse", c.dot)} />
            {c.label}
        </span>
    );
}

const chartTooltipStyle: React.CSSProperties = {
    borderRadius: 12,
    border: "1px solid #e8ddd3",
    backgroundColor: "#fcf6ef",
    fontSize: 12,
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
};

function defaultStats(): DashboardStats {
    return {
        totalUsers: 0,
        totalCompanies: 0,
        totalCreditsIssued: 0,
        totalCreditsConsumed: 0,
        aiRequestsToday: 0,
        revenueOverview: 0,
        revenueBaseCurrency: "USD",
        failedAICalls: 0,
        systemHealthStatus: "healthy",
        activeUsersToday: 0,
        newUsersThisWeek: 0,
    };
}

function defaultAnalytics(): AnalyticsData {
    return {
        topDestinations: [],
        avgCreditsPerUser: 0,
        corporateVsIndividual: { corporate: 0, individual: 0 },
        peakUsageTimes: [],
        monthlyRequests: [],
        dailyActiveUsers: [],
        creditUsageByType: [],
        requestsByModel: [],
        riskDistribution: [],
    };
}

type QuickLinkProps = {
    to: string;
    label: string;
    description: string;
    badge?: string | number;
    badgeVariant?: "neutral" | "warning" | "danger";
};

function QuickLinkCard({ to, label, description, badge, badgeVariant = "neutral" }: QuickLinkProps) {
    const badgeStyles = {
        neutral: "bg-accent/10 text-accent",
        warning: "bg-warning/15 text-warning",
        danger: "bg-danger/10 text-danger",
    };
    return (
        <Link
            to={to}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-border-light/50 bg-white p-4 hover:border-accent/30 hover:shadow-sm transition-all duration-150"
        >
            <div className="min-w-0">
                <p className="text-sm text-heading">{label}</p>
                <p className="text-xs text-muted mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {badge !== undefined && badge !== "" && Number(badge) !== 0 ?
                    <span
                        className={cn(
                            "text-xs tabular-nums px-2 py-1 rounded-lg",
                            badgeStyles[badgeVariant],
                        )}
                    >
                        {typeof badge === "number" ? badge.toLocaleString() : badge}
                    </span>
                    : null}
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
            </div>
        </Link>
    );
}

export default function Dashboard() {
    const { data: statsData, isLoading: statsLoading } = useDashboardStats();
    const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();
    const { data: aiLogsData, isLoading: aiLogsLoading } = useAILogs();
    const { data: abuseFlagsData, isLoading: abuseLoading } = useAbuseFlags();
    const { data: plansData, isLoading: plansLoading } = useGeneratedPlans();
    const { data: systemLogsData, isLoading: logsLoading } = useSystemLogs();

    const stats: DashboardStats = { ...defaultStats(), ...statsData };
    const analytics: AnalyticsData = { ...defaultAnalytics(), ...analyticsData };

    const aiLogs: AIRequestLog[] = aiLogsData ?? [];
    const abuseFlags: AbuseFlag[] = abuseFlagsData ?? [];
    const plans: GeneratedPlan[] = plansData ?? [];
    const systemLogs: SystemLog[] = systemLogsData ?? [];

    const recentRequests = aiLogs.slice(0, 8);
    const unresolvedAbuseCount = abuseFlags.filter((f) => !f.resolved).length;
    const unresolvedFromStats = stats.unresolvedAbuseFlags ?? unresolvedAbuseCount;
    const flaggedPlansCount = plans.filter((p) => p.status === "flagged").length;
    const recentWarnings = systemLogs
        .filter(
            (l) =>
                l.level === "warning" ||
                l.level === "error" ||
                l.level === "critical",
        )
        .slice(0, 5);

    const currencySymbol = (currency: string) => {
        switch ((currency ?? "USD").toUpperCase()) {
            case "NGN":
                return "₦";
            case "EUR":
                return "€";
            case "GBP":
                return "£";
            default:
                return "$";
        }
    };
    const revSymbol = currencySymbol(stats.revenueBaseCurrency);

    const creditUtilPct =
        stats.totalCreditsIssued > 0 ?
            Math.round((stats.totalCreditsConsumed / stats.totalCreditsIssued) * 1000) / 10
            : 0;

    const pieData = [
        { name: "Corporate", value: analytics.corporateVsIndividual?.corporate ?? 0 },
        { name: "Individual", value: analytics.corporateVsIndividual?.individual ?? 0 },
    ];

    const peakChartData = [...(analytics.peakUsageTimes ?? [])]
        .sort((a, b) => a.hour - b.hour)
        .map((p) => ({
            label: `${String(p.hour).padStart(2, "0")}:00`,
            requests: p.requests,
        }));

    const failed7d = stats.failedAiCallsLast7Days ?? 0;
    const showAttentionBanner =
        unresolvedFromStats > 0 || failed7d >= 5 || flaggedPlansCount > 0;

    return (
        <div className="space-y-8 lg:space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted mt-0.5 max-w-xl">
                        Live platform metrics, AI reliability, and shortcuts into the areas you manage
                        most.
                    </p>
                </div>
                {statsLoading ?
                    <div className="h-8 w-44 rounded-xl bg-border-light/50 animate-pulse" />
                    : <SystemHealthBadge status={stats.systemHealthStatus} />}
            </div>

            {showAttentionBanner && !statsLoading ?
                <div
                    className={cn(
                        "rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                        unresolvedFromStats > 0 || failed7d >= 10 ?
                            "border-warning/30 bg-warning/5"
                            : "border-border-light bg-background-primary",
                    )}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className={cn(
                                "w-5 h-5 shrink-0 mt-0.5",
                                unresolvedFromStats > 0 ? "text-warning" : "text-muted",
                            )}
                        />
                        <div>
                            <p className="text-sm text-heading">Attention</p>
                            <ul className="text-xs text-muted mt-1 space-y-0.5 list-disc list-inside">
                                {unresolvedFromStats > 0 ?
                                    <li>
                                        {unresolvedFromStats} unresolved abuse{" "}
                                        {unresolvedFromStats === 1 ? "flag" : "flags"}
                                    </li>
                                    : null}
                                {failed7d >= 5 ?
                                    <li>{failed7d} failed AI calls in the last 7 days</li>
                                    : null}
                                {flaggedPlansCount > 0 ?
                                    <li>{flaggedPlansCount} flagged travel plans</li>
                                    : null}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {unresolvedFromStats > 0 ?
                            <Link
                                to="/admin/abuse"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-warning/15 text-warning hover:bg-warning/25 transition-colors"
                            >
                                Review flags <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            : null}
                        {failed7d >= 5 ?
                            <Link
                                to="/admin/ai-logs/failures"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                            >
                                View failures <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            : null}
                        {flaggedPlansCount > 0 ?
                            <Link
                                to="/admin/plans"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                            >
                                Open plans <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            : null}
                    </div>
                </div>
                : null}

            <section>
                <h2 className="text-xs uppercase tracking-widest text-muted mb-3">
                    Platform overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {statsLoading ?
                        Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
                        : <>
                            <StatCard
                                label="Active users"
                                value={stats.totalUsers.toLocaleString()}
                                detail={`+${stats.newUsersThisWeek.toLocaleString()} new this week · ${stats.activeUsersToday.toLocaleString()} logged in today`}
                                accent
                                icon={<Users className="w-4 h-4" />}
                            />
                            <StatCard
                                label="Organizations"
                                value={stats.totalCompanies.toLocaleString()}
                                detail={`${(stats.totalEmployees ?? 0).toLocaleString()} employees on record`}
                                icon={<Building2 className="w-4 h-4" />}
                                iconClassName="bg-gold/10 text-gold"
                            />
                            <StatCard
                                label={`Revenue (${stats.revenueBaseCurrency ?? "USD"})`}
                                value={`${revSymbol}${stats.revenueOverview.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                detail="Paid invoices converted to reporting currency; configure NGN/USD rates in System settings."
                                icon={<DollarSign className="w-4 h-4" />}
                                iconClassName="bg-success/10 text-success"
                            />
                            <StatCard
                                label="Credits in circulation"
                                value={stats.totalCreditsIssued.toLocaleString()}
                                detail={`${stats.totalCreditsConsumed.toLocaleString()} consumed · ${creditUtilPct}% utilization`}
                                icon={<CreditCard className="w-4 h-4" />}
                                iconClassName="bg-warning/10 text-warning"
                            />
                            <StatCard
                                label="Travel plans"
                                value={(stats.totalTravelPlans ?? plans.length).toLocaleString()}
                                detail="Active itineraries generated on the platform"
                                icon={<FileText className="w-4 h-4" />}
                                iconClassName="bg-info/10 text-info"
                            />
                            <StatCard
                                label="Suspended accounts"
                                value={(stats.suspendedUsers ?? 0).toLocaleString()}
                                detail="Users with suspended access"
                                icon={<UserX className="w-4 h-4" />}
                                iconClassName="bg-button-secondary text-heading"
                            />
                            <StatCard
                                label="Pending invoices"
                                value={(stats.pendingInvoicesCount ?? 0).toLocaleString()}
                                detail="Awaiting payment"
                                icon={<Receipt className="w-4 h-4" />}
                                iconClassName="bg-accent/10 text-accent"
                            />
                            <StatCard
                                label="Avg credits / user"
                                value={analytics.avgCreditsPerUser.toFixed(1)}
                                detail="Mean remaining balance across active users"
                                icon={<Sparkles className="w-4 h-4" />}
                                iconClassName="bg-gold/10 text-gold"
                            />
                            <StatCard
                                label="Affiliate commission paid"
                                value={`${revSymbol}${(stats.affiliateCommissionPaid ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                detail={`${stats.totalActiveAffiliates ?? 0} active affiliates`}
                                icon={<Users className="w-4 h-4" />}
                                iconClassName="bg-info/10 text-info"
                            />
                            <StatCard
                                label="Affiliate commission pending"
                                value={`${revSymbol}${(stats.affiliateCommissionPending ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                detail="Awaiting payout approval"
                                icon={<TrendingUp className="w-4 h-4" />}
                                iconClassName="bg-warning/10 text-warning"
                            />
                        </>
                    }
                </div>
            </section>

            <section>
                <h2 className="text-xs uppercase tracking-widest text-muted mb-3">
                    AI operations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {statsLoading ?
                        Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={`ai-${i}`} />)
                        : <>
                            <StatCard
                                label="AI requests today"
                                value={stats.aiRequestsToday.toLocaleString()}
                                detail="Since midnight (server)"
                                icon={<Activity className="w-4 h-4" />}
                                iconClassName="bg-info/10 text-info"
                            />
                            <StatCard
                                label="AI requests (7 days)"
                                value={(stats.aiRequestsLast7Days ?? 0).toLocaleString()}
                                detail="Rolling week volume"
                                icon={<Bot className="w-4 h-4" />}
                                iconClassName="bg-accent/10 text-accent"
                            />
                            <StatCard
                                label="Success rate (30d)"
                                value={`${(stats.aiSuccessRateLast30Days ?? 100).toFixed(1)}%`}
                                detail="Share of logs with success status"
                                icon={<Percent className="w-4 h-4" />}
                                iconClassName="bg-success/10 text-success"
                            />
                            <StatCard
                                label="Tokens today"
                                value={(stats.tokensUsedToday ?? 0).toLocaleString()}
                                detail="Sum of tokens_used on today's logs"
                                icon={<Zap className="w-4 h-4" />}
                                iconClassName="bg-warning/10 text-warning"
                            />
                            <StatCard
                                label="Failed AI (7d)"
                                value={failed7d.toLocaleString()}
                                detail="Error status in rolling week"
                                icon={<AlertTriangle className="w-4 h-4" />}
                                iconClassName="bg-danger/10 text-danger"
                            />
                            <StatCard
                                label="Failed AI (all time)"
                                value={stats.failedAICalls.toLocaleString()}
                                detail="Historical error logs"
                                icon={<AlertTriangle className="w-4 h-4" />}
                                iconClassName="bg-button-secondary text-heading"
                            />
                        </>
                    }
                </div>
            </section>

            <section>
                <h2 className="text-xs uppercase tracking-widest text-muted mb-3">
                    Shortcuts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <QuickLinkCard
                        to="/admin/users"
                        label="Users"
                        description="Search, suspend, and adjust credits"
                        badge={stats.totalUsers}
                    />
                    <QuickLinkCard
                        to="/admin/companies"
                        label="Organizations"
                        description="Corporate accounts and billing"
                        badge={stats.totalCompanies}
                    />
                    <QuickLinkCard
                        to="/admin/plans"
                        label="Travel plans"
                        description="Review generated health plans"
                        badge={stats.totalTravelPlans ?? plans.length}
                    />
                    <QuickLinkCard
                        to="/admin/ai-logs"
                        label="AI request logs"
                        description="Latency, tokens, and outcomes"
                        badge={stats.aiRequestsLast7Days}
                    />
                    <QuickLinkCard
                        to="/admin/billing"
                        label="Billing"
                        description="Invoices and payment status"
                        badge={stats.pendingInvoicesCount}
                        badgeVariant={
                            (stats.pendingInvoicesCount ?? 0) > 0 ? "warning" : "neutral"
                        }
                    />
                    <QuickLinkCard
                        to="/admin/abuse"
                        label="Abuse flags"
                        description="Trust & safety queue"
                        badge={unresolvedFromStats}
                        badgeVariant={unresolvedFromStats > 0 ? "danger" : "neutral"}
                    />
                    <QuickLinkCard
                        to="/admin/affiliates"
                        label="Affiliates"
                        description="Manage affiliate partners and payouts"
                        badge={stats.totalActiveAffiliates ?? 0}
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-base font-semibold text-heading mb-5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        Monthly requests &amp; revenue
                    </h3>
                    {analyticsLoading ?
                        <div className="h-60 flex items-center justify-center text-muted text-sm">
                            <LucideLoader2 className="w-6 h-6 animate-spin text-accent mr-2" />
                            Loading trends…
                        </div>
                        : <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.monthlyRequests}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e8ddd3"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={chartTooltipStyle}
                                        formatter={(value, name) => {
                                            const n = (name as string) ?? "";
                                            if (n.startsWith("Revenue")) {
                                                return [
                                                    `${revSymbol}${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                                                    n,
                                                ];
                                            }
                                            return [value ?? 0, n];
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{
                                            fontSize: 12,
                                            paddingTop: 8,
                                        }}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                    <Line
                                        name="Requests"
                                        type="monotone"
                                        dataKey="requests"
                                        stroke="#2a7a6a"
                                        strokeWidth={2.5}
                                        dot={{ r: 3, fill: "#2a7a6a" }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        name={`Revenue (${revSymbol})`}
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#c4953a"
                                        strokeWidth={2.5}
                                        dot={{ r: 3, fill: "#c4953a" }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    }
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-base font-semibold text-heading mb-5 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-accent" />
                        Top destinations
                    </h3>
                    {analyticsLoading ?
                        <div className="h-60 flex items-center justify-center text-muted text-sm">
                            <LucideLoader2 className="w-6 h-6 animate-spin text-accent mr-2" />
                            Loading…
                        </div>
                        : <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                    data={analytics.topDestinations.slice(0, 6)}
                                    layout="vertical"
                                    margin={{ left: 4, right: 16 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e8ddd3"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                        width={72}
                                    />
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                    <Bar
                                        dataKey="count"
                                        fill="#2a7a6a"
                                        radius={[0, 6, 6, 0]}
                                        barSize={18}
                                    />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    }
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-accent" />
                        Daily active users
                    </h3>
                    {analyticsLoading ?
                        <div className="h-52 flex items-center justify-center text-muted text-sm">
                            <LucideLoader2 className="w-5 h-5 animate-spin text-accent" />
                        </div>
                        : <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.dailyActiveUsers}>
                                    <defs>
                                        <linearGradient id="dashDau" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2a7a6a" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#2a7a6a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#2a7a6a"
                                        strokeWidth={2}
                                        fill="url(#dashDau)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    }
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent" />
                        User mix
                    </h3>
                    {analyticsLoading ?
                        <div className="h-52 flex items-center justify-center text-muted text-sm">
                            <LucideLoader2 className="w-5 h-5 animate-spin text-accent" />
                        </div>
                        : <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={72}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                    <Legend
                                        wrapperStyle={{ fontSize: 12 }}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    }
                </div>

                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-accent" />
                        Credits by segment
                    </h3>
                    {analyticsLoading ?
                        <div className="h-52 flex items-center justify-center text-muted text-sm">
                            <LucideLoader2 className="w-5 h-5 animate-spin text-accent" />
                        </div>
                        : <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                    data={analytics.creditUsageByType}
                                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                                    <XAxis
                                        dataKey="type"
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                        stroke="#d4c4b4"
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                    <Legend
                                        wrapperStyle={{ fontSize: 11 }}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                    <Bar
                                        dataKey="used"
                                        name="Used"
                                        stackId="a"
                                        fill={CHART_COLORS[0]}
                                        radius={[0, 0, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="remaining"
                                        name="Remaining"
                                        stackId="a"
                                        fill={CHART_COLORS[1]}
                                        radius={[6, 6, 0, 0]}
                                    />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    }
                </div>
            </div>

            {peakChartData.length > 0 && !analyticsLoading ?
                <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                    <h3 className="text-base font-semibold text-heading mb-5 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent" />
                        AI activity by hour of day
                    </h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={peakChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd3" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "#7a6a5a" }}
                                    stroke="#d4c4b4"
                                    tickLine={false}
                                    interval={2}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: "#7a6a5a" }}
                                    stroke="#d4c4b4"
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Bar dataKey="requests" fill="#2a7a6a" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                : null}

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <h3 className="text-base font-semibold text-heading flex items-center gap-2">
                        <Bot className="w-4 h-4 text-accent" />
                        Recent AI requests
                    </h3>
                    <Link
                        to="/admin/ai-logs"
                        className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                    >
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                {aiLogsLoading ?
                    <div className="flex justify-center py-12 text-muted text-sm">
                        <LucideLoader2 className="w-6 h-6 animate-spin text-accent" />
                    </div>
                    : <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left pb-3 text-muted text-xs uppercase tracking-wide">
                                        User
                                    </th>
                                    <th className="text-left pb-3 text-muted text-xs uppercase tracking-wide">
                                        Destination
                                    </th>
                                    <th className="text-left pb-3 text-muted text-xs uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th className="text-left pb-3 text-muted text-xs uppercase tracking-wide">
                                        Tokens
                                    </th>
                                    <th className="text-left pb-3 text-muted text-xs uppercase tracking-wide">
                                        Risk
                                    </th>
                                    <th className="text-left pb-3 text-muted text-xs uppercase tracking-wide">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-border-light/50 last:border-0 hover:bg-background-primary transition-colors duration-150"
                                    >
                                        <td className="py-3 text-heading max-w-[140px] truncate">
                                            {log.userName}
                                        </td>
                                        <td className="py-3 text-body max-w-[160px] truncate">
                                            {log.destination || "—"}
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-xl text-xs",
                                                    log.status === "success" &&
                                                    "bg-success/10 text-success",
                                                    log.status === "error" &&
                                                    "bg-danger/10 text-danger",
                                                    log.status === "flagged" &&
                                                    "bg-warning/10 text-warning",
                                                )}
                                            >
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-muted text-xs tabular-nums">
                                            {log.tokensUsed?.toLocaleString() ?? "—"}
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={cn(
                                                    "px-2.5 py-0.5 rounded-xl text-xs",
                                                    log.riskLevel === "low" &&
                                                    "bg-success/10 text-success",
                                                    log.riskLevel === "medium" &&
                                                    "bg-warning/10 text-warning",
                                                    log.riskLevel === "high" &&
                                                    "bg-danger/10 text-danger",
                                                )}
                                            >
                                                {log.riskLevel}
                                            </span>
                                        </td>
                                        <td className="py-3 text-muted text-xs whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {recentRequests.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-muted text-sm"
                                        >
                                            No recent AI requests
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                }
            </div>

            <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
                <h3 className="text-base font-semibold text-heading mb-5">
                    Quick glance
                </h3>
                {abuseLoading || plansLoading || logsLoading ?
                    <div className="flex justify-center py-8">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                    : <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-background-primary rounded-xl p-4 flex items-start gap-4">
                            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-4.5 h-4.5 text-danger" />
                            </div>
                            <div>
                                <p className="text-xs text-muted uppercase tracking-wide">
                                    Unresolved abuse flags
                                </p>
                                <p className="text-2xl font-serif text-heading leading-tight tabular-nums">
                                    {unresolvedFromStats}
                                </p>
                            </div>
                        </div>

                        <div className="bg-background-primary rounded-xl p-4 flex items-start gap-4">
                            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                                <FileWarning className="w-4.5 h-4.5 text-warning" />
                            </div>
                            <div>
                                <p className="text-xs text-muted uppercase tracking-wide">
                                    Flagged plans
                                </p>
                                <p className="text-2xl font-serif text-heading leading-tight tabular-nums">
                                    {flaggedPlansCount}
                                </p>
                            </div>
                        </div>

                        <div className="bg-background-primary rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2.5">
                                <ServerCrash className="w-4 h-4 text-warning" />
                                <p className="text-xs text-muted uppercase tracking-wide">
                                    System warnings
                                </p>
                            </div>
                            {recentWarnings.length === 0 ?
                                <p className="text-xs text-brand-muted">No recent warnings</p>
                                : <ul className="space-y-1.5">
                                    {recentWarnings.map((log) => (
                                        <li
                                            key={log.id}
                                            className="flex items-start gap-2"
                                        >
                                            <span
                                                className={cn(
                                                    "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                                                    log.level === "warning" && "bg-warning",
                                                    log.level === "error" && "bg-danger",
                                                    log.level === "critical" && "bg-danger",
                                                )}
                                            />
                                            <span className="text-xs text-body leading-snug line-clamp-2">
                                                {log.message}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
