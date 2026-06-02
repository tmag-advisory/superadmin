import { useState } from "react";
import {
  Eye,
  Check,
  X,
  Building2,
  Clock,
  LucideLoader2,
  Users,
  Mail,
  AlertCircle,
  Download,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import {
  useCompanyOnboardingRequests,
  useCompanyOnboardingRequest,
  useApproveCompanyOnboarding,
  useRejectCompanyOnboarding,
} from "../../api/hooks";
import type { CompanyOnboardingRequest } from "../../api/types";

type StatusFilter = "all" | "pending_approval" | "approved" | "rejected";

export default function CompanyOnboardingPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: requestsData, isLoading } = useCompanyOnboardingRequests(
    statusFilter !== "all" ? statusFilter : undefined
  );
  const { data: selectedRequest } = useCompanyOnboardingRequest(selectedId ?? 0);
  const approveMutation = useApproveCompanyOnboarding();
  const rejectMutation = useRejectCompanyOnboarding();

  const requests: CompanyOnboardingRequest[] = requestsData ?? [];

  const pendingCount = requests.filter((r) => r.status === "pending_approval").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to approve this company registration? This will create the company and send invitations to all team members.")) {
      return;
    }
    try {
      await approveMutation.mutateAsync({ id });
      setSelectedId(null);
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve. Please try again.");
    }
  };

  const handleReject = async () => {
    if (!selectedId || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({ id: selectedId, reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedId(null);
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Failed to reject. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending_payment":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div>
      <PageHeader
        title="Company Registrations"
        description="Review and approve new company onboarding requests"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Requests"
          value={requests.length}
          icon={<Building2 className="w-4 h-4" />}
          iconClassName="bg-accent/10 text-accent"
        />
        <StatCard
          label="Pending Approval"
          value={pendingCount}
          icon={<Clock className="w-4 h-4" />}
          iconClassName="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          icon={<Check className="w-4 h-4" />}
          iconClassName="bg-green-50 text-green-600"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount}
          icon={<X className="w-4 h-4" />}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending_approval", "approved", "rejected"] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === tab
                ? "bg-dark text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {formatStatus(tab === "all" ? "All" : tab)}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LucideLoader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No registration requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">No. of Plans</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{req.companyName}</p>
                        <p className="text-xs text-gray-500">{req.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{req.selectedPlanCode}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {req.billingModel === "SEAT"
                      ? `${req.seatCount ?? 0} seats`
                      : (req.creditCount ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{req.contactEmail}</p>
                    <p className="text-xs text-gray-500">{req.teamMembers?.length || 0} team members</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {req.paymentCurrency} {req.paymentAmount?.toLocaleString()}
                    </p>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        req.paymentStatus === "completed"
                          ? "bg-green-50 text-green-600"
                          : req.paymentStatus === "failed"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-50 text-gray-500"
                      )}
                    >
                      {req.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full border",
                        getStatusBadge(req.status)
                      )}
                    >
                      {formatStatus(req.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedId(req.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedId && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Registration Details</h2>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-medium px-3 py-1 rounded-full border",
                    getStatusBadge(selectedRequest.status)
                  )}
                >
                  {formatStatus(selectedRequest.status)}
                </span>
                <span className="text-xs text-gray-500">
                  Submitted {new Date(selectedRequest.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Company info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Company Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedRequest.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Industry</p>
                    <p className="font-medium text-gray-900">{selectedRequest.industry || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contact Email</p>
                    <p className="font-medium text-gray-900">{selectedRequest.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedRequest.contactPhone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Website</p>
                    <p className="font-medium text-gray-900">{selectedRequest.website || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Currency</p>
                    <p className="font-medium text-gray-900">{selectedRequest.billingCurrency}</p>
                  </div>
                </div>
              </div>

              {/* Plan */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Selected Plan</h3>
                <div className="flex items-center justify-between">
                  <div>
                    {selectedRequest.billingModel === "SEAT" ? (
                      <>
                        <p className="font-medium text-gray-900">Seat subscription ({selectedRequest.selectedPlanCode})</p>
                        <p className="text-xs text-gray-500">{selectedRequest.seatCount ?? 0} seats · 4 plans each / year</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-900">{selectedRequest.selectedPlanCode}</p>
                        <p className="text-xs text-gray-500">{selectedRequest.creditCount ?? 0} plans</p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedRequest.paymentCurrency} {selectedRequest.paymentAmount?.toLocaleString()}
                    </p>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        selectedRequest.paymentStatus === "completed"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-50 text-gray-500"
                      )}
                    >
                      Payment {selectedRequest.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample request */}
              {selectedRequest.sampleRequest && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Sample Request / Use Case</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedRequest.sampleRequest}</p>
                </div>
              )}

              {/* Team members */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">
                    Team Members ({selectedRequest.teamMembers?.length || 0})
                  </h3>
                  {selectedRequest.teamMembersCsvUrl && (
                    <a
                      href={selectedRequest.teamMembersCsvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      {selectedRequest.teamMembersCsvFileName || "Download CSV"}
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedRequest.teamMembers?.map((member, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          member.role === "admin"
                            ? "bg-accent/10 text-accent"
                            : "bg-blue-50 text-blue-600"
                        )}
                      >
                        {member.role === "admin" ? "Admin" : "HR"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform employees */}
              {selectedRequest.platformEmployees && selectedRequest.platformEmployees.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Platform Employees to Link ({selectedRequest.platformEmployees.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedRequest.platformEmployees.map((emp, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            {emp.name && <p className="text-sm font-medium text-gray-900">{emp.name}</p>}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              {emp.email}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          Employee
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    These existing platform users will be linked to the company on approval.
                  </p>
                </div>
              )}

              {/* Rejection reason if rejected */}
              {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-red-700 uppercase mb-2">Rejection Reason</h3>
                  <p className="text-sm text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === "pending_approval" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {approveMutation.isPending ? (
                      <LucideLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve & Create Company
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this company registration. The company will be notified via email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-300 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
