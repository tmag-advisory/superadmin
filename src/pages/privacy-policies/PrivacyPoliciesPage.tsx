import { useState, type FormEvent } from "react";
import { AlertCircle, FileText, Loader2, Plus, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import PageHeader from "../../components/PageHeader";
import { cn, formatDateTime } from "../../lib/utils";
import {
    usePrivacyPolicies,
    useCurrentPrivacyPolicy,
    usePublishPrivacyPolicy,
} from "../../api/hooks";
import type { PrivacyPolicyResponse } from "../../api/types";

const INPUT =
    "w-full px-4 py-3 bg-background-primary border border-border-light rounded-xl text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-colors";

interface PolicyForm {
    version: string;
    effective_date: string;
    content: string;
}

const emptyForm: PolicyForm = { version: "", effective_date: "", content: "" };

export default function PrivacyPoliciesPage() {
    const { data: policies, isLoading, isError } = usePrivacyPolicies();
    const { data: current } = useCurrentPrivacyPolicy();
    const publish = usePublishPrivacyPolicy();

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<PolicyForm>(emptyForm);

    const list: PrivacyPolicyResponse[] = policies ?? [];

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const version = form.version.trim();
        const content = form.content.trim();
        if (!version || !content || !form.effective_date) {
            toast.error("Version, effective date, and content are required");
            return;
        }
        publish.mutate(
            { version, content, effective_date: form.effective_date },
            {
                onSuccess: () => {
                    toast.success(`Published version ${version}`);
                    setForm(emptyForm);
                    setShowForm(false);
                },
                onError: (err) => {
                    const message =
                        err instanceof AxiosError && err.response?.data?.message
                            ? (err.response.data.message as string)
                            : "Failed to publish policy";
                    toast.error(message);
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Privacy Policies"
                description="Publish a new privacy-policy version and review version history."
                actions={
                    <button
                        type="button"
                        onClick={() => {
                            setForm(emptyForm);
                            setShowForm((v) => !v);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-dark text-white text-sm font-medium rounded-xl hover:bg-darkest transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {showForm ? "Close" : "Publish version"}
                    </button>
                }
            />

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light p-6 space-y-5">
                    <h2 className="font-semibold text-heading">Publish new version</h2>
                    <p className="text-sm text-muted">
                        Publishing makes this the current policy and supersedes the previous version.
                    </p>
                    <div className="grid md:grid-cols-2 gap-5">
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-heading">Version *</span>
                            <input
                                required
                                type="text"
                                value={form.version}
                                onChange={(e) => setForm((c) => ({ ...c, version: e.target.value }))}
                                className={INPUT}
                                placeholder="e.g. 2026-06"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-heading">Effective date *</span>
                            <input
                                required
                                type="date"
                                value={form.effective_date}
                                onChange={(e) => setForm((c) => ({ ...c, effective_date: e.target.value }))}
                                className={INPUT}
                            />
                        </label>
                    </div>
                    <label className="block space-y-2">
                        <span className="text-sm font-medium text-heading">Content *</span>
                        <textarea
                            required
                            rows={12}
                            value={form.content}
                            onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))}
                            className={`${INPUT} font-mono`}
                            placeholder="Full privacy-policy text…"
                        />
                    </label>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-sm text-muted border border-border-light rounded-xl hover:bg-background-primary transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={publish.isPending}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-darkest disabled:opacity-60 transition-colors"
                        >
                            {publish.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Publish version
                        </button>
                    </div>
                </form>
            )}

            {/* Current policy preview */}
            <section className="bg-white rounded-2xl border border-border-light p-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="font-semibold text-heading flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-accent" /> Current policy
                    </h2>
                    {current && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700">
                            v{current.version}
                        </span>
                    )}
                </div>
                {current ? (
                    <>
                        <p className="text-xs text-muted mb-3">
                            Effective {current.effective_date ?? "—"} · updated {formatDateTime(current.updated_at)}
                        </p>
                        <pre className="text-sm text-body whitespace-pre-wrap font-sans max-h-72 overflow-y-auto bg-background-primary rounded-xl p-4">
                            {current.content}
                        </pre>
                    </>
                ) : (
                    <p className="text-sm text-muted">No current policy is published yet.</p>
                )}
            </section>

            {/* Version history */}
            <section className="space-y-3">
                <h2 className="font-semibold text-heading">Version history</h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-muted" />
                    </div>
                ) : isError ? (
                    <div className="bg-white rounded-2xl border border-border-light p-8 text-center">
                        <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                        <p className="font-medium text-heading">Unable to load policies</p>
                        <p className="text-sm text-muted mt-1">Check your permissions and try again.</p>
                    </div>
                ) : list.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
                        <FileText className="w-10 h-10 text-muted mx-auto mb-3" />
                        <p className="text-heading font-medium">No versions yet</p>
                        <p className="text-sm text-muted mt-1">Publish the first privacy-policy version above.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {list.map((policy) => (
                            <article
                                key={String(policy.id)}
                                className={cn(
                                    "bg-white rounded-2xl border p-5",
                                    policy.is_current ? "border-green-300" : "border-border-light",
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-heading">v{policy.version}</h3>
                                            {policy.is_current && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted mt-0.5">
                                            Effective {policy.effective_date ?? "—"} · updated {formatDateTime(policy.updated_at)}
                                        </p>
                                        <p className="text-sm text-muted mt-2 line-clamp-2">{policy.content}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
