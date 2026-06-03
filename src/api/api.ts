import api from "./axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  AdminUser,
  ManagedUser,
  Company,
  CreditLedgerEntry,
  CreditAdjustment,
  AIRequestLog,
  GeneratedPlan,
  DashboardStats,
  AnalyticsData,
  Invoice,
  SystemSettings,
  SystemLog,
  SystemStatus,
  AdminRole,
  AbuseFlag,
  HRCreateEmployeeRequest,
  CompanyPricing,
  CompanyCreditQuote,
  CompanyCreditPurchase,
  InitiatePurchaseResponse,
  PlanGenerationContext,
  AdminEbook,
  AdminEbookOrder,
  AdminEbookStats,
  CreateEbookRequest,
  UpdateEbookRequest,
  CreateVersionRequest,
  UpdateVersionRequest,
  AdminDoctorApplicationDto,
  AdminDoctorListItemDto,
  AdminDoctorStats,
  CreditPlan,
  AffiliateApplication,
  AdminAffiliate,
  AdminAffiliateDetail,
  AdminAffiliateStats,
  AdminAffiliatePayout,
  AffiliatePeriodStats,
  BlogPost,
  BlogPostRequest,
  BlogCategory,
  BlogCategoryRequest,
  BlogImageUpload,
  PaginatedResponse,
  PaginationParams,
} from "./types";

function buildParams(params?: PaginationParams) {
    if (!params) return {};
    return {
        page: params.page !== undefined ? params.page - 1 : undefined,
        size: params.per_page,
        sort: params.sort,
        order: params.order,
    };
}

export const adminApi = {
    // Auth - /admin/auth/*
    login: (data: LoginRequest) =>
        api.post<ApiResponse<AuthResponse>>("/admin/auth/login", data),
    logout: () => api.post("/admin/auth/logout"),
    getCurrentUser: () => api.get<ApiResponse<AdminUser>>("/admin/auth/me"),

    // Dashboard - /admin/dashboard/*
    getDashboardStats: () =>
        api.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats"),

    // Users - /admin/users/*
    getUsers: () => api.get<ApiResponse<ManagedUser[]>>("/admin/users"),
    getUser: (id: string) =>
        api.get<ApiResponse<ManagedUser>>(`/admin/users/${id}`),
    createUser: (data: Partial<ManagedUser>) =>
        api.post<ApiResponse<ManagedUser>>("/admin/users", data),
    updateUser: (id: string, data: Partial<ManagedUser>) =>
        api.put<ApiResponse<ManagedUser>>(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
    activateUser: (id: string) => api.post(`/admin/users/${id}/activate`),
    resetUserCredits: (id: string, amount: number) =>
        api.post(`/admin/users/${id}/reset-credits`, { amount }),
    resetUserPassword: (id: string) =>
        api.post(`/admin/users/${id}/reset-password`),

    // Companies - /admin/companies/*
    getCompanies: () => api.get<ApiResponse<Company[]>>("/admin/companies"),
    getCompany: (id: string) =>
        api.get<ApiResponse<Company>>(`/admin/companies/${id}`),
    createCompany: (data: Partial<Company>) =>
        api.post<ApiResponse<Company>>("/admin/companies", data),
    updateCompany: (id: string, data: Partial<Company>) =>
        api.put<ApiResponse<Company>>(`/admin/companies/${id}`, data),
    deleteCompany: (id: string) => api.delete(`/admin/companies/${id}`),
    getCompanyEmployees: (id: string) =>
        api.get<ApiResponse<ManagedUser[]>>(`/admin/companies/${id}/employees`),
    freezeCompany: (id: string) => api.post(`/admin/companies/${id}/freeze`),
    unfreezeCompany: (id: string) =>
        api.post(`/admin/companies/${id}/unfreeze`),
    addCompanyCredits: (id: string, amount: number) =>
        api.post(`/admin/companies/${id}/add-credits`, { amount }),
    setCompanyPlan: (id: string, planCode: string) =>
        api.put<ApiResponse<Company>>(`/admin/companies/${id}`, { planCode }),

    // Credit Ledger - /admin/ledger/*
    getCreditLedger: (params?: { userId?: string; companyId?: string }) =>
        api.get<ApiResponse<CreditLedgerEntry[]>>("/admin/ledger", { params }),
    adjustCredits: (data: CreditAdjustment) =>
        api.post<ApiResponse<CreditLedgerEntry>>("/admin/ledger/adjust", data),

    // Billing - /admin/billing/*
    getInvoices: () =>
        api.get<ApiResponse<Invoice[]>>("/admin/billing/invoices"),
    getInvoice: (id: string) =>
        api.get<ApiResponse<Invoice>>(`/admin/billing/invoices/${id}`),
    createInvoice: (data: Partial<Invoice>) =>
        api.post<ApiResponse<Invoice>>("/admin/billing/invoices", data),
    updateInvoice: (id: string, data: Partial<Invoice>) =>
        api.put<ApiResponse<Invoice>>(`/admin/billing/invoices/${id}`, data),
    markInvoicePaid: (id: string) =>
        api.post(`/admin/billing/invoices/${id}/paid`),

    // AI Logs - /admin/ai-logs/*
    getAILogs: (params?: { userId?: string; status?: string }) =>
        api.get<ApiResponse<AIRequestLog[]>>("/admin/ai-logs", { params }),
    getAILog: (id: string) =>
        api.get<ApiResponse<AIRequestLog>>(`/admin/ai-logs/${id}`),
    flagAILog: (id: string) => api.post(`/admin/ai-logs/${id}/flag`),

    // Plans - /admin/plans/*
    getGeneratedPlans: (params?: { userId?: string; companyId?: string }) =>
        api.get<ApiResponse<GeneratedPlan[]>>("/admin/plans", { params }),
    getGeneratedPlan: (id: string) =>
        api.get<ApiResponse<GeneratedPlan>>(`/admin/plans/${id}`),
    deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),
    archivePlan: (id: string) => api.post(`/admin/plans/${id}/archive`),
    flagPlan: (id: string) => api.post(`/admin/plans/${id}/flag`),

    // Plan Contexts - /admin/plan-contexts/*
    getPlanContexts: () =>
        api.get<ApiResponse<PlanGenerationContext[]>>("/admin/plan-contexts"),
    uploadPlanContext: (title: string, file: File) => {
        const data = new FormData();
        data.append("title", title);
        data.append("file", file);
        return api.post<ApiResponse<PlanGenerationContext>>(
            "/admin/plan-contexts",
            data,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
    },
    setPlanContextActive: (id: string, active: boolean) =>
        api.put<ApiResponse<PlanGenerationContext>>(
            `/admin/plan-contexts/${id}/active`,
            null,
            { params: { active } },
        ),
    deletePlanContext: (id: string) => api.delete(`/admin/plan-contexts/${id}`),

    // Analytics - /admin/analytics/*
    getAnalytics: () => api.get<ApiResponse<AnalyticsData>>("/admin/analytics"),

    // System Status - /admin/system/status/*
    getSystemStatus: () =>
        api.get<ApiResponse<SystemStatus>>("/admin/system/status"),

    // System Logs - /admin/system/logs/*
    getSystemLogs: (params?: { level?: string; limit?: number }) =>
        api.get<ApiResponse<SystemLog[]>>("/admin/system/logs", { params }),

    // System Settings - /admin/system/settings/*
    getSystemSettings: () =>
        api.get<ApiResponse<SystemSettings>>("/admin/system/settings"),
    updateSystemSettings: (data: Partial<SystemSettings>) =>
        api.put<ApiResponse<SystemSettings>>("/admin/system/settings", data),
    toggleMaintenanceMode: () =>
        api.post("/admin/system/settings/toggle-maintenance"),
    fetchLiveRates: () =>
        api.post<
            ApiResponse<{ rates: Record<string, number>; lastFetched: string }>
        >("/admin/system/settings/fetch-live-rates"),

    // Roles - /admin/roles/*
    getRoles: () => api.get<ApiResponse<AdminRole[]>>("/admin/roles"),
    getRole: (id: string) =>
        api.get<ApiResponse<AdminRole>>(`/admin/roles/${id}`),
    createRole: (data: Partial<AdminRole>) =>
        api.post<ApiResponse<AdminRole>>("/admin/roles", data),
    updateRole: (id: string, data: Partial<AdminRole>) =>
        api.put<ApiResponse<AdminRole>>(`/admin/roles/${id}`, data),
    deleteRole: (id: string) => api.delete(`/admin/roles/${id}`),

    // Admin Users - /admin/admin-users/*
    getAdminUsers: () =>
        api.get<ApiResponse<AdminUser[]>>("/admin/admin-users"),
    getAdminUser: (id: string) =>
        api.get<ApiResponse<AdminUser>>(`/admin/admin-users/${id}`),
    createAdminUser: (data: Partial<AdminUser>) =>
        api.post<ApiResponse<AdminUser>>("/admin/admin-users", data),
    updateAdminUser: (id: string, data: Partial<AdminUser>) =>
        api.put<ApiResponse<AdminUser>>(`/admin/admin-users/${id}`, data),
    deleteAdminUser: (id: string) => api.delete(`/admin/admin-users/${id}`),

    // Abuse Flags - /admin/abuse/*
    getAbuseFlags: (params?: { resolved?: boolean }) =>
        api.get<ApiResponse<AbuseFlag[]>>("/admin/abuse", { params }),
    resolveAbuseFlag: (id: string) => api.post(`/admin/abuse/${id}/resolve`),

    // ─── HR Management (standard authenticated endpoints) ───────

    // Employees - /employees/*
    hrGetEmployees: (companyId?: string) =>
        api.get("/employees", { params: companyId ? { companyId } : {} }),
    hrCreateEmployee: (data: HRCreateEmployeeRequest) =>
        api.post("/employees", data),
    hrUpdateEmployee: (id: string, data: Partial<HRCreateEmployeeRequest>) =>
        api.put(`/employees/${id}`, data),
    hrDeleteEmployee: (id: string) => api.delete(`/employees/${id}`),
    hrAllocateCredits: (id: string, creditsAllocated: number) =>
        api.put(`/employees/${id}/credits`, { creditsAllocated }),
    hrUpdateEmployeeStatus: (id: string, status: "active" | "inactive") =>
        api.put(`/employees/${id}/status`, { status }),

    // Travel Requests - /travel-requests/*
    hrGetTravelRequests: (companyId?: string) =>
        api.get("/travel-requests", { params: companyId ? { companyId } : {} }),
    hrApproveTravelRequest: (id: string) =>
        api.post(`/travel-requests/${id}/approve`),
    hrRejectTravelRequest: (id: string) =>
        api.post(`/travel-requests/${id}/reject`),

    // Credits - /companies/:id/purchase-credits
    hrPurchaseCredits: (
        companyId: string,
        amount: number,
        reference?: string,
    ) =>
        api.post(`/companies/${companyId}/purchase-credits`, {
            amount,
            reference,
        }),
    hrGetCreditLedger: (companyId: string) =>
        api.get("/credits", { params: { companyId } }),

    // Company Admin Credit Purchase - /company-admin/credits/*
    getCompanyPricing: (companyId: string) =>
        api.get<ApiResponse<CompanyPricing>>(`/company-admin/credits/pricing`, {
            params: { companyId },
        }),
    getCompanyCreditQuote: (companyId: string, credits: number) =>
        api.post<ApiResponse<CompanyCreditQuote>>(
            `/company-admin/credits/quote`,
            null,
            { params: { companyId, credits } },
        ),
    initiateCompanyCreditPurchase: (companyId: string, credits: number) =>
        api.post<ApiResponse<InitiatePurchaseResponse>>(
            `/company-admin/credits/purchase`,
            { companyId, credits },
        ),
    verifyCompanyCreditPurchase: (txRef: string, transactionId?: string) =>
        api.get<
            ApiResponse<{ success: boolean; purchase: CompanyCreditPurchase }>
        >(`/company-admin/credits/verify/${txRef}`, {
            params: transactionId ? { transaction_id: transactionId } : {},
        }),
    getCompanyCreditHistory: (companyId?: string) =>
        api.get<ApiResponse<CompanyCreditPurchase[]>>(
            `/company-admin/credits/history`,
            { params: companyId ? { companyId } : {} },
        ),
    getCompanyCreditPurchase: (txRef: string) =>
        api.get<ApiResponse<CompanyCreditPurchase>>(
            `/company-admin/credits/${txRef}`,
        ),

    // Blog posts - /admin/blog-posts/*
    getBlogPosts: (params?: PaginationParams) =>
        api
            .get<ApiResponse<PaginatedResponse<BlogPost>>>("/admin/blog-posts", {
                params: buildParams(params),
            })
            .then((r) => r.data.data),
    getBlogPost: (id: number) =>
        api
            .get<ApiResponse<BlogPost>>(`/admin/blog-posts/${id}`)
            .then((r) => r.data.data),
    createBlogPost: (data: BlogPostRequest) =>
        api
            .post<ApiResponse<BlogPost>>("/admin/blog-posts", data)
            .then((r) => r.data.data),
    updateBlogPost: (id: number, data: BlogPostRequest) =>
        api
            .put<ApiResponse<BlogPost>>(`/admin/blog-posts/${id}`, data)
            .then((r) => r.data.data),
    deleteBlogPost: (id: number) => api.delete(`/admin/blog-posts/${id}`),
    uploadBlogImage: (file: File) => {
        const data = new FormData();
        data.append("file", file);
        return api
            .post<ApiResponse<BlogImageUpload>>(
                "/admin/blog-posts/upload-image",
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            )
            .then((r) => r.data.data);
    },

    // Blog categories - /admin/blog-categories/*
    getBlogCategories: () =>
        api
            .get<ApiResponse<BlogCategory[]>>("/admin/blog-categories")
            .then((r) => r.data.data),
    createBlogCategory: (data: BlogCategoryRequest) =>
        api
            .post<ApiResponse<BlogCategory>>("/admin/blog-categories", data)
            .then((r) => r.data.data),
    updateBlogCategory: (id: number, data: BlogCategoryRequest) =>
        api
            .put<ApiResponse<BlogCategory>>(`/admin/blog-categories/${id}`, data)
            .then((r) => r.data.data),
    deleteBlogCategory: (id: number) =>
        api.delete(`/admin/blog-categories/${id}`),

    // Ebooks - /api/admin/ebooks/*
    getEbooks: () =>
        api
            .get<ApiResponse<AdminEbook[]>>("/admin/ebooks")
            .then((r) => r.data.data),
    createEbook: (data: CreateEbookRequest) =>
        api
            .post<ApiResponse<AdminEbook>>("/admin/ebooks", data)
            .then((r) => r.data.data),
    updateEbook: (id: number, data: UpdateEbookRequest) =>
        api
            .put<ApiResponse<AdminEbook>>(`/admin/ebooks/${id}`, data)
            .then((r) => r.data.data),
    deleteEbook: (id: number) => api.delete(`/admin/ebooks/${id}`),
    addVersion: (ebookId: number, data: CreateVersionRequest) =>
        api
            .post<
                ApiResponse<AdminEbook>
            >(`/admin/ebooks/${ebookId}/versions`, data)
            .then((r) => r.data.data),
    updateVersion: (
        ebookId: number,
        versionId: number,
        data: UpdateVersionRequest,
    ) =>
        api
            .put<
                ApiResponse<AdminEbook>
            >(`/admin/ebooks/${ebookId}/versions/${versionId}`, data)
            .then((r) => r.data.data),
    deleteVersion: (ebookId: number, versionId: number) =>
        api.delete(`/admin/ebooks/${ebookId}/versions/${versionId}`),
    getEbookOrders: (ebookId: number) =>
        api
            .get<
                ApiResponse<AdminEbookOrder[]>
            >(`/admin/ebooks/${ebookId}/orders`)
            .then((r) => r.data.data),
    getAllEbookOrders: () =>
        api
            .get<ApiResponse<AdminEbookOrder[]>>("/admin/ebooks/orders")
            .then((r) => r.data.data),
    getEbookStats: () =>
        api
            .get<ApiResponse<AdminEbookStats>>("/admin/ebooks/stats")
            .then((r) => r.data.data),
    uploadEbookPdf: (file: File) => {
        const data = new FormData();
        data.append("file", file);
        return api
            .post<
                ApiResponse<{
                    fileUrl: string;
                    fileKey: string;
                    fileSizeMb: number;
                    fileName: string;
                }>
            >("/admin/ebooks/upload-pdf", data, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data.data);
    },

    // Company Onboarding - /admin/company-onboarding/*
    getCompanyOnboardingRequests: (status?: string) =>
        api
            .get<ApiResponse<import("./types").CompanyOnboardingRequest[]>>(
                "/admin/company-onboarding",
                {
                    params: status ? { status } : undefined,
                },
            )
            .then((r) => r.data.data),
    getCompanyOnboardingRequest: (id: number) =>
        api
            .get<
                ApiResponse<import("./types").CompanyOnboardingRequest>
            >(`/admin/company-onboarding/${id}`)
            .then((r) => r.data.data),
    approveCompanyOnboarding: (id: number, adminEmail?: string) =>
        api
            .post<
                ApiResponse<import("./types").CompanyOnboardingRequest>
            >(`/admin/company-onboarding/${id}/approve`, { adminEmail })
            .then((r) => r.data.data),
    rejectCompanyOnboarding: (
        id: number,
        reason: string,
        adminEmail?: string,
    ) =>
        api
            .post<
                ApiResponse<import("./types").CompanyOnboardingRequest>
            >(`/admin/company-onboarding/${id}/reject`, { reason, adminEmail })
            .then((r) => r.data.data),

    // Doctors - /admin/doctors/*
    getDoctorApplications: () =>
        api
            .get<
                ApiResponse<AdminDoctorApplicationDto[]>
            >("/admin/doctors/applications")
            .then((r) => r.data.data),
    getDoctors: () =>
        api
            .get<ApiResponse<{ doctors: AdminDoctorListItemDto[] }>>("/admin/doctors")
            .then((r) => r.data.data.doctors),
    getDoctorStats: () =>
        api
            .get<ApiResponse<AdminDoctorStats>>("/admin/doctors/stats")
            .then((r) => r.data.data),
    approveDoctorApplication: (userId: number, adminEmail?: string) =>
        api
            .post<
                ApiResponse<AdminDoctorApplicationDto>
            >(`/admin/doctors/applications/${userId}/approve`, { adminEmail })
            .then((r) => r.data.data),
    rejectDoctorApplication: (
        userId: number,
        reason: string,
        adminEmail?: string,
    ) =>
        api
            .post<
                ApiResponse<AdminDoctorApplicationDto>
            >(`/admin/doctors/applications/${userId}/reject`, { reason, adminEmail })
            .then((r) => r.data.data),
    revokeDoctor: (userId: number, adminEmail?: string) =>
        api
            .post<
                ApiResponse<AdminDoctorListItemDto>
            >(`/admin/doctors/${userId}/revoke`, { adminEmail })
            .then((r) => r.data.data),

    // Credit Plans
    getCreditPlans: (companyId?: string) =>
        api
            .get<ApiResponse<CreditPlan[]>>('/user-credit-plans', {
                params: companyId ? { companyId } : undefined,
            })
            .then((r) => r.data.data),
    createCustomCreditPlan: (data: Partial<CreditPlan>) =>
        api
            .post<ApiResponse<CreditPlan>>('/user-credit-plans/custom', data)
            .then((r) => r.data.data),

    // Affiliates
    getAffiliateApplications: () =>
        api
            .get<ApiResponse<AffiliateApplication[]>>("/admin/affiliates/applications")
            .then((r) => r.data.data),
    getAffiliateApplication: (id: number) =>
        api
            .get<ApiResponse<AffiliateApplication>>(`/admin/affiliates/applications/${id}`)
            .then((r) => r.data.data),
    approveAffiliateApplication: (id: number) =>
        api
            .post<ApiResponse<AdminAffiliateDetail>>(`/admin/affiliates/applications/${id}/approve`)
            .then((r) => r.data.data),
    rejectAffiliateApplication: (id: number, reason: string) =>
        api
            .post<ApiResponse<void>>(`/admin/affiliates/applications/${id}/reject`, { reason })
            .then((r) => r.data.data),
    requestAffiliateInfo: (id: number, notes: string) =>
        api
            .post<ApiResponse<void>>(`/admin/affiliates/applications/${id}/request-info`, { notes })
            .then((r) => r.data.data),
    getAffiliates: () =>
        api
            .get<ApiResponse<AdminAffiliate[]>>("/admin/affiliates")
            .then((r) => r.data.data),
    getAffiliateStats: () =>
        api
            .get<ApiResponse<AdminAffiliateStats>>("/admin/affiliates/stats")
            .then((r) => r.data.data),
    getAffiliateDetail: (id: number) =>
        api
            .get<ApiResponse<AdminAffiliateDetail>>(`/admin/affiliates/${id}`)
            .then((r) => r.data.data),
    getAffiliatePeriodStats: (id: number, startDate?: string, endDate?: string) =>
        api
            .get<ApiResponse<AffiliatePeriodStats>>(`/admin/affiliates/${id}/stats`, { params: { startDate, endDate } })
            .then((r) => r.data.data),
    suspendAffiliate: (id: number) =>
        api
            .post<ApiResponse<void>>(`/admin/affiliates/${id}/suspend`)
            .then((r) => r.data.data),
    activateAffiliate: (id: number) =>
        api
            .post<ApiResponse<void>>(`/admin/affiliates/${id}/activate`)
            .then((r) => r.data.data),
    updateAffiliateCommissionRate: (id: number, rate: number) =>
        api
            .put<ApiResponse<void>>(`/admin/affiliates/${id}/commission-rate`, { rate })
            .then((r) => r.data.data),

    // Affiliate Payouts
    getAffiliatePayouts: (status?: string) =>
        api
            .get<ApiResponse<AdminAffiliatePayout[]>>("/admin/affiliates/payouts", { params: status ? { status } : {} })
            .then((r) => r.data.data),
    approveAffiliatePayout: (payoutId: number) =>
        api
            .post<ApiResponse<AdminAffiliatePayout>>(`/admin/affiliates/payouts/${payoutId}/approve`)
            .then((r) => r.data.data),
    rejectAffiliatePayout: (payoutId: number, reason: string) =>
        api
            .post<ApiResponse<AdminAffiliatePayout>>(`/admin/affiliates/payouts/${payoutId}/reject`, { reason })
            .then((r) => r.data.data),
    completeAffiliatePayout: (payoutId: number) =>
        api
            .post<ApiResponse<AdminAffiliatePayout>>(`/admin/affiliates/payouts/${payoutId}/complete`)
            .then((r) => r.data.data),
};
