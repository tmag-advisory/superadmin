import { useState } from "react";
import { AlertCircle, Check, Loader2, MapPin, ShieldX, X } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { formatEnumLabel, formatDateTime } from "../../lib/utils";
import {
    useTravelPlanDeletions,
    useApproveTravelPlanDeletion,
    useRejectTravelPlanDeletion,
} from "../../api/hooks";
import type { TravelPlanDeletionResponse } from "../../api/types";

export default function TravelPlanDeletionsPage() {
    const { data, isLoading, isError } = useTravelPlanDeletions({ size: 100 });
    const approve = useApproveTravelPlanDeletion();
    const reject = useRejectTravelPlanDeletion();

    const [approveId, setApproveId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState(false);

    const plans: TravelPlanDeletionResponse[] = data?.content ?? [];

    const handleApprove = async () => {
        if (!approveId) return;
        try {
            await approve.mutateAsync(approveId);
            toast.success("Travel-plan deletion approved");
            setApproveId(null);
        } catch {
            toast.error("Failed to approve deletion");
        }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        if (!reason.trim()) {
            setReasonError(true);
            return;
        }
        try {
            await reject.mutateAsync({ planId: rejectId, reason: reason.trim() });
            toast.success("Deletion rejected — plan retained");
            setRejectId(null);
            setReason("");
        } catch {
            toast.error("Failed to reject deletion");
        }
    };

    return (
        <div>
            <PageHeader
                title="Travel-Plan Deletions"
                description="Approve or reject pending travel-plan deletion requests from organizations."
                badge={
                    <span className="px-2.5 py-0.5 rounded-xl text-xs font-medium bg-accent/10 text-accent">
                        {plans.length} pending
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
                    <p className="font-medium text-heading">Unable to load deletions</p>
                    <p className="text-sm text-muted mt-1">Check your permissions and try again.</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                    <MapPin className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-heading font-medium">No deletions awaiting approval</p>
                    <p className="text-sm text-muted mt-1">Plans pending deletion will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border-light bg-background-primary">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Destination</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Traveler</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Organization ID</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Deletion status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Requested</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={String(plan.id)} className="border-b border-border-light/60 hover:bg-background-primary/60">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted" />
                                            <div>
                                                <p className="text-sm font-medium text-heading">{plan.destination}</p>
                                                <p className="text-xs text-muted">{plan.country}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-body">{plan.traveler_name || "—"}</td>
                                    <td className="px-4 py-3 text-sm text-body">{plan.organization_id != null ? String(plan.organization_id) : "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-medium px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                                            {formatEnumLabel(plan.deletion_status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted">{formatDateTime(plan.updated_at ?? plan.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setApproveId(String(plan.id))}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 border border-green-200 transition-colors"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectId(String(plan.id));
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
                title="Approve travel-plan deletion"
                description="The plan will be soft-deleted and removed from the organization. This cannot be undone."
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
                title="Reject travel-plan deletion"
                description="Rejecting keeps the plan. Provide a reason for the audit log."
            >
                <label htmlFor="tp-reason" className="block text-sm font-medium text-heading mb-2">
                    Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="tp-reason"
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (e.target.value.trim()) setReasonError(false);
                    }}
                    rows={3}
                    aria-required="true"
                    aria-invalid={reasonError}
                    aria-describedby={reasonError ? "tp-reason-error" : undefined}
                    placeholder="Reason for rejection..."
                    className="w-full border border-border-light rounded-xl px-4 py-3 text-sm outline-none focus:border-red-300 transition-colors resize-none"
                />
                {reasonError && (
                    <p id="tp-reason-error" className="text-xs text-red-600 mt-1.5">
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
