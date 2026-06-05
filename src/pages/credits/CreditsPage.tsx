import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  History,
  ChevronDown,
  X,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { cn } from "../../lib/utils";
import {
  useCompanies,
  useCompanyPricing,
  useCompanyCreditQuote,
  useInitiateCompanyCreditPurchase,
  useVerifyCompanyCreditPurchase,
  useCompanyCreditHistory,
} from "../../api/hooks";
import type { Company, CompanyCreditQuote, CompanyCreditPurchase } from "../../api/types";

type CheckoutStep = "select" | "review" | "processing" | "success" | "failed";

export default function CreditsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: companiesData } = useCompanies();
  const companies: Company[] = companiesData || [];

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [credits, setCredits] = useState<number>(50);
  const [step, setStep] = useState<CheckoutStep>("select");
  const [quote, setQuote] = useState<CompanyCreditQuote | null>(null);
  const [txRef, setTxRef] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: pricing } = useCompanyPricing(selectedCompanyId);
  const quoteMutation = useCompanyCreditQuote();
  const initiateMutation = useInitiateCompanyCreditPurchase();
  const verifyMutation = useVerifyCompanyCreditPurchase();
  const {
    data: purchaseHistory,
    isLoading: historyLoading,
    isFetching: historyFetching,
  } = useCompanyCreditHistory(selectedCompanyId || undefined);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.industry || "").toLowerCase().includes(companySearch.toLowerCase())
  );

  // Handle Flutterwave callback
  const handleCallback = useCallback(
    async (txRefParam: string, status: string | null, transactionId: string | null) => {
      setStep("processing");
      setTxRef(txRefParam);

      if (status && status !== "successful" && status !== "completed") {
        setStep("failed");
        setErrorMsg(
          status === "cancelled"
            ? "Payment was cancelled"
            : `Payment ${status}`
        );
        return;
      }

      try {
        const result = await verifyMutation.mutateAsync({
          txRef: txRefParam,
          transactionId: transactionId || undefined,
        });
        const responseData = result.data?.data;
        if (responseData?.success) {
          setStep("success");
        } else {
          setStep("failed");
          setErrorMsg(
            responseData?.purchase?.failedReason || "Payment verification failed"
          );
        }
      } catch (err: unknown) {
        setStep("failed");
        setErrorMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Verification failed");
      }

      // Clean URL params
      setSearchParams({}, { replace: true });
    },
    [verifyMutation, setSearchParams]
  );

  // Check for callback params on mount
  useEffect(() => {
    const txRefParam = searchParams.get("tx_ref");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");

    if (txRefParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleCallback(txRefParam, status, transactionId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGetQuote = async () => {
    if (!selectedCompanyId || !credits) return;

    try {
      const result = await quoteMutation.mutateAsync({
        companyId: selectedCompanyId,
        credits,
      });
      const quoteData = result.data?.data || null;
      setQuote(quoteData);
      if (quoteData?.qualifiesForContactSales) {
        window.location.href = "/contact";
        return;
      }
      setStep("review");
    } catch (err: unknown) {
      setErrorMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to get quote");
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedCompanyId || !credits) return;

    setStep("processing");
    try {
      const result = await initiateMutation.mutateAsync({
        companyId: selectedCompanyId,
        credits,
      });
      const data = result.data?.data;
      if (data?.paymentLink) {
        setTxRef(data.txRef);
        window.location.href = data.paymentLink;
      } else {
        setStep("failed");
        setErrorMsg("No payment link received");
      }
    } catch (err: unknown) {
      setStep("failed");
      setErrorMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to initiate payment");
    }
  };

  const resetFlow = () => {
    setStep("select");
    setQuote(null);
    setTxRef("");
    setErrorMsg("");
  };

  const sym = pricing?.currencySymbol || "₦";

  return (
    <div className="space-y-8 lg:space-y-10">
      <PageHeader
        title="Organization credit purchase"
        description="Purchase credits for organizations at their billing currency rates."
        actions={
          <button
            type="button"
            disabled={!selectedCompanyId}
            onClick={() => setShowHistory((v) => !v)}
            title={
              selectedCompanyId ? undefined : "Select an organization to view purchase history"
            }
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
              !selectedCompanyId && "opacity-50 cursor-not-allowed",
              showHistory && selectedCompanyId
                ? "bg-accent text-white"
                : "bg-button-secondary border border-border-light text-heading hover:bg-background-secondary",
            )}
          >
            <History className="w-4 h-4" />
            {showHistory && selectedCompanyId ? "Hide history" : "Show history"}
          </button>
        }
      />

      {/* Payment Status Banner */}
      {step === "success" && (
        <div className="bg-success/10 border border-success/30 rounded-2xl p-6 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-success shrink-0" />
          <div className="flex-1">
            <p className="text-heading font-semibold">Payment Successful</p>
            <p className="text-sm text-muted">
              Credits have been added to the organization account.
            </p>
          </div>
          <button
            onClick={resetFlow}
            className="px-4 py-2 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90"
          >
            New Purchase
          </button>
        </div>
      )}

      {step === "failed" && (
        <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 flex items-center gap-4">
          <XCircle className="w-8 h-8 text-danger shrink-0" />
          <div className="flex-1">
            <p className="text-heading font-semibold">Payment Failed</p>
            <p className="text-sm text-muted">{errorMsg}</p>
          </div>
          <button
            onClick={resetFlow}
            className="px-4 py-2 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Step 1: Select Company & Credits */}
      {(step === "select" || step === "review") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Company & Credit Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Selector */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
              <h2 className="text-base font-semibold text-heading mb-4">
                Select Organization
              </h2>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-background-primary border border-border rounded-xl text-sm text-left"
                >
                  <span className={selectedCompany ? "text-heading" : "text-muted"}>
                    {selectedCompany
                      ? `${selectedCompany.name} (${selectedCompany.industry || "N/A"})`
                      : "Choose an organization..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="text"
                          placeholder="Search organizations..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCompanies.length === 0 ? (
                        <p className="text-sm text-muted p-4 text-center">
                          No organizations found
                        </p>
                      ) : (
                        filteredCompanies.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCompanyId(c.id);
                              setShowHistory(true);
                              setDropdownOpen(false);
                              setQuote(null);
                              setStep("select");
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-background-primary transition-colors flex items-center justify-between",
                              selectedCompanyId === c.id && "bg-accent/5"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium text-heading">
                                {c.name}
                              </p>
                              <p className="text-xs text-muted">
                                {c.industry || "No industry"} · {c.activeEmployees}{" "}
                                employees
                              </p>
                            </div>
                            {selectedCompanyId === c.id && (
                              <CheckCircle className="w-4 h-4 text-accent" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info */}
              {pricing && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-background-primary rounded-xl p-3">
                      <p className="text-xs text-muted">Currency</p>
                      <p className="text-sm font-semibold text-heading">
                        {pricing.currency} ({pricing.currencySymbol})
                      </p>
                    </div>
                    <div className="bg-background-primary rounded-xl p-3">
                      <p className="text-xs text-muted">Applied Tier</p>
                      <p className="text-sm font-semibold text-heading">
                        {pricing.appliedTier === "TIER_3" || pricing.appliedTier === "TIER_3_PLUS"
                          ? "Tier 3"
                          : pricing.appliedTier === "TIER_2"
                          ? "Tier 2"
                          : "Tier 1"}
                      </p>
                    </div>
                    <div className="bg-background-primary rounded-xl p-3">
                      <p className="text-xs text-muted">Price per Credit</p>
                      <p className="text-sm font-semibold text-heading">
                        {pricing.currencySymbol}
                        {pricing.pricePerCredit.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Contact Sales Banner */}
                  {pricing.qualifiesForContactSales && (
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                      <p className="text-sm font-semibold text-accent">
                        500+ credits — Custom pricing available
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Contact our sales team for custom pricing on your next purchase.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Credit Quantity */}
            {pricing && (
              <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-4">
                  Select Credit Quantity
                </h2>

                {/* Tier Pricing Table */}
                <div className="mb-6 p-4 bg-background-primary rounded-xl">
                  <p className="text-xs text-muted mb-2 font-medium">Volume Pricing (per credit)</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={cn(
                      "p-2 rounded-lg",
                      pricing.appliedTier === "TIER_1" ? "bg-accent/10 border border-accent" : ""
                    )}>
                      <p className="text-xs text-muted">1–{pricing.tier1MaxCredits} credits</p>
                      <p className="text-sm font-semibold text-heading">{sym}{pricing.standardTier1Price}</p>
                    </div>
                    <div className={cn(
                      "p-2 rounded-lg",
                      pricing.appliedTier === "TIER_2" ? "bg-accent/10 border border-accent" : ""
                    )}>
                      <p className="text-xs text-muted">{pricing.tier1MaxCredits + 1}–{pricing.tier2MaxCredits} credits</p>
                      <p className="text-sm font-semibold text-heading">{sym}{pricing.standardTier2Price}</p>
                    </div>
                    <div className={cn(
                      "p-2 rounded-lg",
                      pricing.appliedTier === "TIER_3" || pricing.appliedTier === "TIER_3_PLUS" ? "bg-accent/10 border border-accent" : ""
                    )}>
                      <p className="text-xs text-muted">{pricing.tier2MaxCredits + 1}+ credits</p>
                      <p className="text-sm font-semibold text-heading">{sym}{pricing.standardTier3Price}</p>
                    </div>
                  </div>
                </div>

                {/* Quick select packages */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[50, 100, 200].map((qty) => {
                    const baseTotal = qty * pricing.pricePerCredit;

                    return (
                      <button
                        key={qty}
                        onClick={() => {
                          setCredits(qty);
                          setQuote(null);
                          setStep("select");
                        }}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all",
                          credits === qty
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <span className="text-2xl font-serif text-heading block">
                          {qty}
                        </span>
                        <span className="text-xs text-muted">credits</span>
                        <span className="text-sm font-semibold text-heading block mt-2">
                          {sym}
                          {baseTotal.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom amount */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted whitespace-nowrap">
                    Custom amount:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={credits}
                    onChange={(e) => {
                      setCredits(parseInt(e.target.value) || 0);
                      setQuote(null);
                      setStep("select");
                    }}
                    className="w-32 px-3 py-2 bg-background-primary border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>

                <button
                  onClick={handleGetQuote}
                  disabled={
                    !selectedCompanyId ||
                    credits < 1 ||
                    quoteMutation.isPending
                  }
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quoteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {!selectedCompanyId && (
              <div className="bg-white rounded-2xl border border-border-light/50 p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-heading font-medium">
                  Select an organization to get started
                </p>
                <p className="text-sm text-muted mt-1">
                  Pricing will be shown in the organization's billing currency
                </p>
              </div>
            )}
          </div>

          {/* Right: Quote Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 sticky top-6">
              <h2 className="text-base font-semibold text-heading mb-4">
                Order Summary
              </h2>

              {!quote ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">
                    {selectedCompanyId
                      ? "Select credits and click Continue"
                      : "Select an organization first"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Organization</span>
                    <span className="text-heading font-medium">
                      {quote.companyName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Credits</span>
                    <span className="text-heading font-medium">
                      {quote.credits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Price per credit</span>
                    <span className="text-heading font-medium">
                      {quote.currencySymbol}
                      {quote.pricePerCredit.toLocaleString()}
                    </span>
                  </div>
                  {quote.appliedTier && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Applied Tier</span>
                      <span className="text-accent font-medium">
                        {quote.appliedTier}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-heading">
                      {quote.currencySymbol}
                      {quote.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-heading font-semibold">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-serif text-heading">
                        {quote.currencySymbol}
                        {quote.totalAmount.toLocaleString()}
                      </span>
                      <span className="block text-xs text-muted">
                        {quote.currency}
                      </span>
                    </div>
                  </div>

                  {quote.qualifiesForContactSales && (
                    <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-xl text-center">
                      <p className="text-xs text-accent font-medium">
                        500+ credits purchased historically
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Contact sales for custom pricing
                      </p>
                    </div>
                  )}

                  {step === "review" && !quote.qualifiesForContactSales && (
                    <button
                      onClick={handleInitiatePayment}
                      disabled={initiateMutation.isPending}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold hover:bg-dark/90 transition-colors disabled:opacity-50"
                    >
                      {initiateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {step === "processing" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-16 text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-heading font-medium text-lg">
            Processing payment...
          </p>
          <p className="text-sm text-muted mt-1">
            {txRef && (
              <span className="font-mono">Ref: {txRef}</span>
            )}
          </p>
        </div>
      )}

      {/* Purchase history for selected company (loads as soon as a company is chosen) */}
      {selectedCompanyId && showHistory && (
        <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-heading">
                Credit purchase history
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {selectedCompany?.name ?? "Selected organization"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-muted hover:text-heading"
              aria-label="Hide purchase history"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Organization
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Credits
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Currency
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Ref
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyLoading || historyFetching ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      <Loader2 className="w-6 h-6 animate-spin text-accent inline-block mr-2 align-middle" />
                      Loading transactions…
                    </td>
                  </tr>
                ) : !purchaseHistory || purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      No purchase history found for this organization
                    </td>
                  </tr>
                ) : (
                  (purchaseHistory as CompanyCreditPurchase[]).map(
                    (purchase) => (
                      <tr
                        key={String(purchase.id)}
                        className="border-b border-border-light/50 last:border-0"
                      >
                        <td className="p-4 text-muted text-xs whitespace-nowrap">
                          {new Date(purchase.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-heading font-medium text-xs">
                          {selectedCompany?.name ?? `Organization #${purchase.companyId}`}
                        </td>
                        <td className="p-4 text-heading font-bold">
                          +{purchase.creditsPurchased}
                        </td>
                        <td className="p-4 text-heading font-medium">
                          {purchase.currencySymbol}
                          {purchase.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-muted text-xs">
                          {purchase.currency}
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                              purchase.status === "completed" &&
                                "bg-success/10 text-success",
                              purchase.status === "pending" &&
                                "bg-warning/10 text-warning",
                              purchase.status === "failed" &&
                                "bg-danger/10 text-danger"
                            )}
                          >
                            {purchase.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted text-xs font-mono">
                          {purchase.txRef}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
