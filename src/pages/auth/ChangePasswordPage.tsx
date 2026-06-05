import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { adminApi } from "../../api/api";
import { getAuthCookie } from "../../api/axios";
import { useAdminAuthStore } from "../../stores/adminAuthStore";

const INPUT =
    "w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const passwordExpired = useAdminAuthStore((s) => s.passwordExpired);
    const setPasswordExpired = useAdminAuthStore((s) => s.setPasswordExpired);

    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // No session → nothing to change; bounce to login.
    if (!getAuthCookie()) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!current || !next) {
            setError("Fill in your current and new password.");
            return;
        }
        if (next !== confirm) {
            setError("New password and confirmation do not match.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            await adminApi.changePassword({ current_password: current, new_password: next });
            setPasswordExpired(false);
            toast.success("Password updated");
            navigate("/admin/dashboard");
        } catch (err) {
            const message =
                err instanceof AxiosError && err.response?.data?.message
                    ? (err.response.data.message as string)
                    : "Could not update password. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            <div className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md">
                    <span className="text-xl font-serif font-medium tracking-tight text-heading">
                        TMAG
                    </span>
                    <span className="block text-[10px] text-muted uppercase tracking-widest mt-1 mb-8">
                        Admin
                    </span>

                    <h1 className="text-2xl md:text-3xl font-serif text-heading mb-2 flex items-center gap-2">
                        <KeyRound className="w-6 h-6 text-accent" /> Change your password
                    </h1>
                    <p className="text-sm text-body mb-8">
                        {passwordExpired
                            ? "Your password has expired. Set a new one to continue."
                            : "Update your account password."}
                    </p>

                    {error && (
                        <div
                            id="change-password-error"
                            role="alert"
                            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" aria-describedby={error ? "change-password-error" : undefined}>
                        <div>
                            <label
                                htmlFor="cp-current"
                                className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2"
                            >
                                Current password
                            </label>
                            <input
                                id="cp-current"
                                type={show ? "text" : "password"}
                                value={current}
                                onChange={(e) => {
                                    setCurrent(e.target.value);
                                    setError("");
                                }}
                                className={INPUT}
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="cp-new"
                                className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2"
                            >
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    id="cp-new"
                                    type={show ? "text" : "password"}
                                    value={next}
                                    onChange={(e) => {
                                        setNext(e.target.value);
                                        setError("");
                                    }}
                                    className={`${INPUT} pr-10`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow((v) => !v)}
                                    aria-label={show ? "Hide passwords" : "Show passwords"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                                >
                                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="cp-confirm"
                                className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2"
                            >
                                Confirm new password
                            </label>
                            <input
                                id="cp-confirm"
                                type={show ? "text" : "password"}
                                value={confirm}
                                onChange={(e) => {
                                    setConfirm(e.target.value);
                                    setError("");
                                }}
                                className={INPUT}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? "Updating..." : "Update password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
