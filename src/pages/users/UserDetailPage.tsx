import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  RotateCcw,
  CreditCard,
  Mail,
  Calendar,
  Shield,
  Phone,
  MapPin,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  Save,
  Plus,
  Minus,
  KeyRound,
  ShieldOff,
  LucideLoader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  useUser,
  useGeneratedPlans,
  useCreditLedger,
  useSuspendUser,
  useActivateUser,
  useResetUserCredits,
  useUpdateUser,
  useResetUserPassword,
  useDisable2fa,
} from "../../api/hooks";
import type { GeneratedPlan, CreditLedgerEntry, ManagedUser } from "../../api/types";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

type TabKey = "overview" | "edit" | "credits" | "ledger" | "plans";

const TABS: { key: TabKey; label: string; path: string }[] = [
  { key: "overview", label: "Overview", path: "" },
  { key: "edit", label: "Edit", path: "/edit" },
  { key: "credits", label: "Credits", path: "/credits" },
  { key: "ledger", label: "Ledger", path: "/ledger" },
  { key: "plans", label: "Plans", path: "/plans" },
];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const { data: userData, isLoading: userLoading } = useUser(id ?? "");
  const { data: plansData } = useGeneratedPlans({ userId: id });
  const { data: ledgerData } = useCreditLedger({ userId: id });

  const suspendMutation = useSuspendUser();
  const activateMutation = useActivateUser();
  const resetCreditsMutation = useResetUserCredits();
  const updateMutation = useUpdateUser();
  const resetPasswordMutation = useResetUserPassword();
  const disable2faMutation = useDisable2fa();

  const user = userData as ManagedUser | undefined;
  const plans: GeneratedPlan[] = (plansData ?? []) as GeneratedPlan[];
  const ledger: CreditLedgerEntry[] = (ledgerData ?? []) as CreditLedgerEntry[];

  const basePath = `/admin/users/${id}`;
  const activeTab: TabKey = (() => {
    const suffix = location.pathname.replace(basePath, "");
    const match = TABS.find((t) => t.path !== "" && suffix.startsWith(t.path));
    return match ? match.key : "overview";
  })();

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  const [creditAmount, setCreditAmount] = useState(10);
  const [creditReason, setCreditReason] = useState("");
  const [show2faModal, setShow2faModal] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [disableReasonError, setDisableReasonError] = useState(false);

  useEffect(() => {
    if (user) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setEditForm({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        location: user.location ?? "",
        bio: user.bio ?? "",
      });
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">User not found</p>
      </div>
    );
  }

  const userPlans = plans;
  const userLedger = ledger;
  const recentLedger = userLedger.slice(0, 5);
  const totalCredits = user.creditsUsed + user.creditsRemaining;

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: user.id,
      data: {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        location: editForm.location || undefined,
        bio: editForm.bio || undefined,
      },
    });
  };

  const handleSuspend = () => {
    suspendMutation.mutate(user.id);
  };

  const handleActivate = () => {
    activateMutation.mutate(user.id);
  };

  const handleAddCredits = (amount: number) => {
    resetCreditsMutation.mutate({
      id: user.id,
      amount: user.creditsRemaining + amount,
    });
  };

  const handleDeductCredits = (amount: number) => {
    resetCreditsMutation.mutate({
      id: user.id,
      amount: Math.max(0, user.creditsRemaining - amount),
    });
  };

  const handleDisable2fa = () => {
    if (!disableReason.trim()) {
      setDisableReasonError(true);
      return;
    }
    disable2faMutation.mutate(
      { userId: user.id, reason: disableReason.trim() },
      {
        onSuccess: () => {
          toast.success("Two-factor authentication disabled for this user");
          setShow2faModal(false);
          setDisableReason("");
        },
        onError: () => toast.error("Failed to disable 2FA"),
      },
    );
  };

  return (
    <div className="space-y-8">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-heading transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <div className="border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              to={`${basePath}${tab.path}`}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150",
                activeTab === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-heading hover:border-border"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-bold font-serif shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-xl font-serif text-heading">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                        user.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      )}
                    >
                      {user.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent capitalize">
                      {user.role?.replace(/_/g, " ") ?? "user"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-gold/10 text-gold capitalize">
                      {user.planType}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {user.phone}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "N/A"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    {user.role?.replace(/_/g, " ") ?? "user"}
                  </span>
                </div>
                {user.bio && <p className="text-sm text-body">{user.bio}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Credits Remaining",
                value: user.creditsRemaining,
                icon: CreditCard,
                color: "text-accent",
              },
              {
                label: "Credits Used",
                value: user.creditsUsed,
                icon: TrendingDown,
                color: "text-brand-muted",
              },
              {
                label: "Plans Generated",
                value: user.plansGenerated,
                icon: FileText,
                color: "text-info",
              },
              {
                label: "Last Active",
                value: user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : "N/A",
                icon: Clock,
                color: "text-muted",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-border-light/50 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
                <p className={cn("text-lg font-bold font-serif", s.color)}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {user.riskFlags && user.riskFlags.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-warning">
                  Risk Flags ({user.riskFlags.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.riskFlags.map((flag) => (
                  <span
                    key={flag}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-warning/10 text-warning capitalize"
                  >
                    {flag.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8 max-w-2xl">
          <h2 className="text-base font-semibold text-heading mb-5">Edit User</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Phone</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                placeholder="Optional"
              />
            </div>
            <button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors duration-150 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {activeTab === "credits" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h2 className="text-base font-semibold text-heading mb-4">Current Credits</h2>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold font-serif text-accent">
                  {user.creditsRemaining}
                </p>
                <p className="text-xs text-muted mt-1">remaining of {totalCredits} total</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: `${totalCredits > 0 ? (user.creditsRemaining / totalCredits) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h2 className="text-base font-semibold text-heading mb-4">
              Adjust Credits
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-40 px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Reason</label>
                <textarea
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-border-light/50 rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                  placeholder="Reason for adjustment..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddCredits(creditAmount)}
                  disabled={resetCreditsMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Credits
                </button>
                <button
                  onClick={() => handleDeductCredits(creditAmount)}
                  disabled={resetCreditsMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" /> Deduct Credits
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
            <h2 className="text-base font-semibold text-heading mb-4">
              Recent Credit Movements
            </h2>
            {recentLedger.length === 0 ? (
              <p className="text-sm text-muted">No recent credit activity.</p>
            ) : (
              <div className="space-y-3">
                {recentLedger.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b border-border-light last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      {entry.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-danger" />
                      )}
                      <div>
                        <p className="text-sm text-heading capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted">{entry.reason}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        entry.amount > 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <h2 className="text-base font-semibold text-heading mb-4">
            Credit Ledger ({userLedger.length})
          </h2>
          {userLedger.length === 0 ? (
            <p className="text-sm text-muted">No credit activity.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">Action</th>
                    <th className="text-left pb-3 text-muted font-medium">Amount</th>
                    <th className="text-left pb-3 text-muted font-medium">Balance</th>
                    <th className="text-left pb-3 text-muted font-medium">Reason</th>
                    <th className="text-left pb-3 text-muted font-medium">Triggered By</th>
                    <th className="text-left pb-3 text-muted font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {userLedger.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3">
                        <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-button-secondary text-body capitalize">
                          {entry.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "py-3 pr-3 font-medium",
                          entry.amount > 0 ? "text-success" : "text-danger"
                        )}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount}
                      </td>
                      <td className="py-3 pr-3 text-body">
                        {entry.balanceBefore} → {entry.balanceAfter}
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs max-w-[200px] truncate">
                        {entry.reason}
                      </td>
                      <td className="py-3 pr-3 text-muted text-xs">{entry.triggeredBy ?? "—"}</td>
                      <td className="py-3 text-muted text-xs">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "plans" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
          <h2 className="text-base font-semibold text-heading mb-4">
            Generated Plans ({userPlans.length})
          </h2>
          {userPlans.length === 0 ? (
            <p className="text-sm text-muted">No plans generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-3 text-muted font-medium">Destination</th>
                    <th className="text-left pb-3 text-muted font-medium">Duration</th>
                    <th className="text-left pb-3 text-muted font-medium">Risk Score</th>
                    <th className="text-left pb-3 text-muted font-medium">Vaccinations</th>
                    <th className="text-left pb-3 text-muted font-medium">Status</th>
                    <th className="text-left pb-3 text-muted font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {userPlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="border-b border-border-light hover:bg-background-primary transition-colors duration-150"
                    >
                      <td className="py-3 pr-3">
                        <Link
                          to={`/admin/plans/${plan.id}`}
                          className="text-heading font-medium hover:text-accent transition-colors duration-150"
                        >
                          {plan.destination}
                        </Link>
                      </td>
                      <td className="py-3 pr-3 text-body text-xs">{plan.duration}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium",
                            plan.riskScore < 30
                              ? "bg-success/10 text-success"
                              : plan.riskScore < 60
                                ? "bg-warning/10 text-warning"
                                : "bg-danger/10 text-danger"
                          )}
                        >
                          {plan.riskScore}%
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-body text-xs">
                        {plan.vaccinations?.length ?? 0}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                            plan.status === "active"
                              ? "bg-success/10 text-success"
                              : plan.status === "flagged"
                                ? "bg-warning/10 text-warning"
                                : "bg-danger/10 text-danger"
                          )}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted text-xs">
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-light/50 p-6 lg:p-8">
        <h3 className="text-sm font-semibold text-heading mb-4">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {user.status === "active" ? (
            <button
              onClick={handleSuspend}
              disabled={suspendMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
            >
              <Ban className="w-4 h-4" /> Suspend User
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={activateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-sm font-medium hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Reactivate User
            </button>
          )}
          <button
            onClick={() => resetPasswordMutation.mutate(user.id)}
            disabled={resetPasswordMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-button-secondary text-body rounded-xl text-sm font-medium hover:bg-background-primary transition-colors duration-150 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" /> {resetPasswordMutation.isPending ? "Sending..." : "Reset Password"}
          </button>
          <button
            onClick={() => resetCreditsMutation.mutate({ id: user.id, amount: 20 })}
            disabled={resetCreditsMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors duration-150 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" /> Reset Credits
          </button>
          <button
            onClick={() => {
              setDisableReason("");
              setDisableReasonError(false);
              setShow2faModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors duration-150"
          >
            <ShieldOff className="w-4 h-4" /> Disable 2FA
          </button>
        </div>
      </div>

      <Modal
        open={show2faModal}
        onClose={() => setShow2faModal(false)}
        title="Disable two-factor authentication"
        description="This removes 2FA for the user so they can sign in to re-enroll. A reason is recorded in the security audit log."
      >
        <label htmlFor="disable-2fa-reason" className="block text-sm font-medium text-heading mb-2">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          id="disable-2fa-reason"
          value={disableReason}
          onChange={(e) => {
            setDisableReason(e.target.value);
            if (e.target.value.trim()) setDisableReasonError(false);
          }}
          rows={3}
          aria-required="true"
          aria-invalid={disableReasonError}
          aria-describedby={disableReasonError ? "disable-2fa-error" : undefined}
          placeholder="Why is 2FA being disabled for this user?"
          className="w-full border border-border-light rounded-xl px-4 py-3 text-sm outline-none focus:border-red-300 transition-colors resize-none"
        />
        {disableReasonError && (
          <p id="disable-2fa-error" className="text-xs text-red-600 mt-1.5">
            A reason is required to disable 2FA.
          </p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShow2faModal(false)}
            className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDisable2fa}
            disabled={disable2faMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-danger text-white rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {disable2faMutation.isPending ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
            Disable 2FA
          </button>
        </div>
      </Modal>
    </div>
  );
}