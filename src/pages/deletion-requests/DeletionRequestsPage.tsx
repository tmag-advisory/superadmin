import { useState } from "react";
import { AlertCircle, Check, Loader2, ShieldX, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { cn, formatEnumLabel, formatDateTime } from "../../lib/utils";
import {
    useDeletionRequests,
    useApproveDeletionRequest,
    useRejectDeletionRequest,
} from "../../api/hooks";
import type { DeletionRequestResponse, DeletionRequestStatus } from "../../api/types";

const STATUS_STYLES: Record<DeletionRequestStatus, string> = {
    PENDING_GRACE: "bg-amber-50 text-amber-700 border-amber-200",
    PENDING_APPROVAL: "bg-yellow-50 text-yellow-700 border-yellow-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function DeletionRequestsPage() {
    const { data, isLoading, isError } = useDeletionRequests({ size: 100 });
    const approve = useApproveDeletionRequest();
    const reject = useRejectDeletionRequest();

    const [approveId, setApproveId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState(false);

    const requests: DeletionRequestResponse[] = data?.content ?? [];

    const handleApprove = async () => {
        if (!approveId) return;
        try {
            await approve.mutateAsync(approveId);
            toast.success("Deletion request approved");
            setApproveId(null);
        } catch {
            toast.error("Failed to approve request");
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        if (!reason.trim()) {
            setReasonError(true);
            return;
        }
        try {
            await reject.mutateAsync({ id: rejectId, reason: reason.trim() });
            toast.success("Deletion request rejected — account restored");
            setRejectId(null);
            setReason("");
        } catch {
            toast.error("Failed to reject request");
        }
    };

    return (
        <div>
            <PageHeader
                title="Deletion Requests"
                description="Review pending account and organization erasure requests awaiting approval."
                badge={
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent">
                        {requests.length} pending
                    </span>
                }
            />

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-muted" />
                </div>
            ) : isError ? (
                <div className="bg-white rounded-2xl border border-border-light p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                    <p className="font-medium text-heading">Unable to load deletion requests</p>
                    <p className="text-sm text-muted mt-1">Check your permissions and try again.</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                    <Trash2 className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-heading font-medium">No requests awaiting approval</p>
                    <p className="text-sm text-muted mt-1">
                        Approved or grace-period requests do not appear here.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-background-primary">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">User ID</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Organization ID</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Grace deadline</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Requested at</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={String(req.id)} className="border-b border-border-light/60 hover:bg-background-primary/60">
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full border border-border-light bg-background-primary text-body">
                                            {req.type === "ORG_BULK" ? "Organization (bulk)" : "User"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", STATUS_STYLES[req.status])}>
                                            {formatEnumLabel(req.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-heading">{String(req.user_id)}</td>
                                    <td className="px-4 py-3 text-sm text-body">{req.organization_id != null ? String(req.organization_id) : "—"}</td>
                                    <td className="px-4 py-3 text-xs text-muted">{formatDateTime(req.grace_deadline)}</td>
                                    <td className="px-4 py-3 text-xs text-muted">{formatDateTime(req.requested_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setApproveId(String(req.id))}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 border border-green-200 transition-colors"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectId(String(req.id));
                                                    setReason("");
                                                    setReasonError(false);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 border border-red-200 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Approve confirm */}
            <Modal
                open={approveId !== null}
                onClose={() => setApproveId(null)}
                title="Approve deletion request"
                description="This permanently anonymizes the affected data. This cannot be undone."
            >
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setApproveId(null)}
                        className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        disabled={approve.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                        {approve.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve deletion
                    </button>
                </div>
            </Modal>

            {/* Reject with reason */}
            <Modal
                open={rejectId !== null}
                onClose={() => setRejectId(null)}
                title="Reject deletion request"
                description="Rejecting restores the account. Provide a reason for the audit log."
            >
                <label htmlFor="dr-reason" className="block text-sm font-medium text-heading mb-2">
                    Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="dr-reason"
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (e.target.value.trim()) setReasonError(false);
                    }}
                    rows={3}
                    aria-required="true"
                    aria-invalid={reasonError}
                    aria-describedby={reasonError ? "dr-reason-error" : undefined}
                    placeholder="Reason for rejection..."
                    className="w-full border border-border-light rounded-xl px-4 py-3 text-sm outline-none focus:border-red-300 transition-colors resize-none"
                />
                {reasonError && (
                    <p id="dr-reason-error" className="text-xs text-red-600 mt-1.5">
                        A reason is required to reject.
                    </p>
                )}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => setRejectId(null)}
                        className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleReject}
                        disabled={reject.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
                    >
                        {reject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldX className="w-4 h-4" />}
                        Confirm rejection
                    </button>
                </div>
            </Modal>
        </div>
    );
}
