import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Lock,
    ShieldCheck,
    KeyRound,
    Copy,
    Download,
    ArrowLeft,
    Mail,
    Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useAdminAuthStore } from "../../stores/adminAuthStore";
import { adminApi } from "../../api/api";
import { setAuthCookie } from "../../api/axios";
import { queryKeys } from "../../api";
import type {
    AdminLoginResult,
    TwoFactorMethod,
    TwoFactorSetupResult,
} from "../../api/types";

type Step = "credentials" | "setup" | "verify";

const INPUT =
    "w-full bg-white border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors duration-200";

function errorMessage(err: unknown, fallback: string): string {
    if (err instanceof AxiosError && err.response?.data?.message) {
        return err.response.data.message as string;
    }
    return fallback;
}

export default function LoginPage() {
    const [step, setStep] = useState<Step>("credentials");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 2FA challenge state (login is standalone, so it lives in component state)
    const [challengeToken, setChallengeToken] = useState("");
    const [method, setMethod] = useState<TwoFactorMethod>("EMAIL_OTP");
    const [setup, setSetup] = useState<TwoFactorSetupResult | null>(null);
    const [savedBackup, setSavedBackup] = useState(false);
    const [code, setCode] = useState("");
    const [useBackup, setUseBackup] = useState(false);
    const [resendIn, setResendIn] = useState(0);

    const login = useAdminAuthStore((s) => s.login);
    const setPasswordExpired = useAdminAuthStore((s) => s.setPasswordExpired);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const finalize = (result: AdminLoginResult) => {
        if (!result.token || result.exp === undefined || !result.user) {
            setError("Login response was incomplete. Please try again.");
            return;
        }
        setAuthCookie(result.token, result.exp);
        queryClient.setQueryData(queryKeys.currentUser, result.user);
        login({
            id: String(result.user.id),
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            permissions: result.user.permissions || [],
            avatar: result.user.avatar,
        });
        setPasswordExpired(!!result.password_expired);
        navigate(result.password_expired ? "/admin/change-password" : "/admin/dashboard");
    };

    const sendEmailOtp = async () => {
        if (!challengeToken || resendIn > 0) return;
        try {
            await adminApi.challenge2fa(challengeToken);
            setResendIn(30);
            toast.success("A verification code was sent to your email.");
        } catch (err) {
            toast.error(errorMessage(err, "Could not send the code. Try again."));
        }
    };

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const result = (await adminApi.login({ email, password })).data.data;
            const m = (result.two_factor_method ?? "EMAIL_OTP") as TwoFactorMethod;

            if (result.two_factor_setup_required) {
                setChallengeToken(result.challenge_token ?? "");
                setMethod(m);
                const setupResult = await adminApi.setup2fa({
                    challenge_token: result.challenge_token,
                    method: m,
                });
                setSetup(setupResult);
                setSavedBackup(false);
                setCode("");
                setStep("setup");
            } else if (result.two_factor_required) {
                setChallengeToken(result.challenge_token ?? "");
                setMethod(m);
                setCode("");
                setUseBackup(false);
                setStep("verify");
                if (m === "EMAIL_OTP") setResendIn(30); // server already emailed the OTP
            } else {
                finalize(result);
            }
        } catch (err) {
            setError(errorMessage(err, "Invalid credentials or access denied"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            setError("Enter the verification code");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const result = await adminApi.verify2fa({
                challenge_token: challengeToken,
                code: code.trim(),
                backup: useBackup,
            });
            finalize(result);
        } catch (err) {
            setError(errorMessage(err, "Invalid or expired code"));
        } finally {
            setIsLoading(false);
        }
    };

    const copyText = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied`);
        } catch {
            toast.error("Copy failed — select and copy manually");
        }
    };

    const downloadBackupCodes = () => {
        if (!setup?.backupCodes?.length) return;
        const blob = new Blob(
            [
                "TMAG Admin — two-factor backup codes\n",
                "Each code can be used once. Store them somewhere safe.\n\n",
                setup.backupCodes.join("\n"),
                "\n",
            ],
            { type: "text/plain" },
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tmag-admin-backup-codes.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const backToCredentials = () => {
        setStep("credentials");
        setError("");
        setCode("");
        setChallengeToken("");
        setSetup(null);
        setResendIn(0);
    };

    return (
        <div className="min-h-screen bg-background-primary flex flex-col">
            <div className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md">
                    <Link to="/admin" className="inline-block mb-8">
                        <span className="text-xl font-serif font-medium tracking-tight text-heading">
                            TMAG
                        </span>
                        <span className="block text-[10px] text-muted uppercase tracking-widest mt-1">
                            Admin
                        </span>
                    </Link>

                    {error && (
                        <div
                            role="alert"
                            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                        >
                            {error}
                        </div>
                    )}

                    {step === "credentials" && (
                        <>
                            <h1 className="text-3xl md:text-4xl font-serif text-heading mb-2">
                                Admin sign in
                            </h1>
                            <p className="text-sm text-body mb-8">
                                Access the admin dashboard to manage the platform.
                            </p>
                            <form onSubmit={handleCredentials} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="login-email"
                                        className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="admin@example.com"
                                        className={INPUT}
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="login-password"
                                        className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="••••••••"
                                            className={`${INPUT} pr-10`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>
                            <p className="text-xs text-muted text-center mt-8 flex items-center justify-center gap-1.5">
                                <Lock className="w-3 h-3" />
                                Only SuperAdmin and Administrator accounts can access this portal.
                            </p>
                        </>
                    )}

                    {step === "setup" && setup && (
                        <>
                            <button
                                type="button"
                                onClick={backToCredentials}
                                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h1 className="text-2xl md:text-3xl font-serif text-heading mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-accent" /> Set up two-factor
                            </h1>
                            <p className="text-sm text-body mb-6">
                                Two-factor authentication is required for every admin account. Finish
                                setup to continue.
                            </p>

                            {/* One-time backup codes */}
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
                                <p className="text-sm font-semibold text-amber-800">
                                    Save your backup codes now
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    These codes are shown <strong>only once</strong>. Each works a single
                                    time if you lose access to your method.
                                </p>
                                <ul className="grid grid-cols-2 gap-2 mt-3 font-mono text-sm text-heading">
                                    {setup.backupCodes.map((c) => (
                                        <li
                                            key={c}
                                            className="bg-white rounded-lg px-2 py-1 border border-amber-200 text-center"
                                        >
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => copyText(setup.backupCodes.join("\n"), "Backup codes")}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> Copy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={downloadBackupCodes}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Download
                                    </button>
                                </div>
                                <label className="flex items-center gap-2 mt-3 text-xs text-amber-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={savedBackup}
                                        onChange={(e) => setSavedBackup(e.target.checked)}
                                    />
                                    I have saved my backup codes.
                                </label>
                            </div>

                            {/* TOTP secret (manual entry — scan with an authenticator app) */}
                            {method === "TOTP" && setup.secret && (
                                <div className="rounded-xl border border-border-light bg-white p-4 mb-5">
                                    <p className="text-sm font-semibold text-heading">
                                        Authenticator app
                                    </p>
                                    <p className="text-xs text-muted mt-1">
                                        Add this key to your authenticator app (Google Authenticator,
                                        1Password, Authy…), then enter the 6-digit code it shows.
                                    </p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <code className="flex-1 font-mono text-sm bg-background-primary rounded-lg px-3 py-2 break-all">
                                            {setup.secret}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => copyText(setup.secret ?? "", "Secret key")}
                                            aria-label="Copy secret key"
                                            className="p-2 rounded-lg border border-border-light text-muted hover:text-heading"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {setup.otpauthUri && (
                                        <button
                                            type="button"
                                            onClick={() => copyText(setup.otpauthUri ?? "", "Setup URL")}
                                            className="mt-2 text-xs text-accent hover:underline"
                                        >
                                            Copy provisioning URL instead
                                        </button>
                                    )}
                                </div>
                            )}

                            {method === "EMAIL_OTP" && (
                                <div className="rounded-xl border border-border-light bg-white p-4 mb-5">
                                    <p className="text-sm font-semibold text-heading flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-accent" /> Email verification
                                    </p>
                                    <p className="text-xs text-muted mt-1">
                                        Send a 6-digit code to {email} and enter it below to enable 2FA.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={sendEmailOtp}
                                        disabled={resendIn > 0 || !savedBackup}
                                        className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-button-secondary text-body hover:bg-background-primary disabled:opacity-50 transition-colors"
                                    >
                                        {resendIn > 0 ? `Resend in ${resendIn}s` : "Send code"}
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-3">
                                <label
                                    htmlFor="setup-code"
                                    className="block text-xs font-semibold text-muted uppercase tracking-wider"
                                >
                                    Verification code
                                </label>
                                <input
                                    id="setup-code"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="123456"
                                    className={INPUT}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !savedBackup}
                                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4" />
                                    )}
                                    Verify & enable
                                </button>
                                {!savedBackup && (
                                    <p className="text-xs text-muted text-center">
                                        Confirm you saved the backup codes to continue.
                                    </p>
                                )}
                            </form>
                        </>
                    )}

                    {step === "verify" && (
                        <>
                            <button
                                type="button"
                                onClick={backToCredentials}
                                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h1 className="text-2xl md:text-3xl font-serif text-heading mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-accent" /> Verify your identity
                            </h1>
                            <p className="text-sm text-body mb-6">
                                {useBackup
                                    ? "Enter one of your single-use backup codes."
                                    : method === "EMAIL_OTP"
                                      ? `Enter the 6-digit code we emailed to ${email}.`
                                      : "Enter the 6-digit code from your authenticator app."}
                            </p>

                            <form onSubmit={handleVerify} className="space-y-3">
                                <label
                                    htmlFor="verify-code"
                                    className="block text-xs font-semibold text-muted uppercase tracking-wider"
                                >
                                    {useBackup ? "Backup code" : "Verification code"}
                                </label>
                                <input
                                    id="verify-code"
                                    inputMode={useBackup ? "text" : "numeric"}
                                    autoComplete="one-time-code"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        setError("");
                                    }}
                                    placeholder={useBackup ? "xxxx-xxxx" : "123456"}
                                    className={INPUT}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4" />
                                    )}
                                    Verify
                                </button>
                            </form>

                            <div className="flex items-center justify-between mt-4 text-xs">
                                {method === "EMAIL_OTP" && !useBackup ? (
                                    <button
                                        type="button"
                                        onClick={sendEmailOtp}
                                        disabled={resendIn > 0}
                                        className="text-accent hover:underline disabled:text-muted disabled:no-underline"
                                    >
                                        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                                    </button>
                                ) : (
                                    <span />
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseBackup((v) => !v);
                                        setCode("");
                                        setError("");
                                    }}
                                    className="inline-flex items-center gap-1 text-muted hover:text-heading"
                                >
                                    <KeyRound className="w-3.5 h-3.5" />
                                    {useBackup ? "Use a code instead" : "Use a backup code"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
