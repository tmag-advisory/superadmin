import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./api";
import { getAuthCookie } from "./axios";
import type { LoginRequest, CreditAdjustment, CreateEbookRequest, UpdateEbookRequest, CreateVersionRequest, UpdateVersionRequest, CreditPlan, ManagedUser, Company, Invoice, SystemSettings, AdminRole, AdminUser, BlogPostRequest, BlogCategoryRequest, PaginationParams } from "./types";

export const queryKeys = {
  currentUser: ["admin", "currentUser"] as const,

  dashboard: ["admin", "dashboard", "stats"] as const,

  users: ["admin", "users"] as const,
  user: (id: string) => ["admin", "users", id] as const,

  companies: ["admin", "companies"] as const,
  company: (id: string) => ["admin", "companies", id] as const,
  companyEmployees: (id: string) => ["admin", "companies", id, "employees"] as const,

  creditLedger: (params?: { userId?: string; companyId?: string }) =>
    ["admin", "ledger", params] as const,

  invoices: ["admin", "billing", "invoices"] as const,
  invoice: (id: string) => ["admin", "billing", "invoices", id] as const,

  aiLogs: (params?: { userId?: string; status?: string }) =>
    ["admin", "ai-logs", params] as const,
  aiLog: (id: string) => ["admin", "ai-logs", id] as const,

  generatedPlans: (params?: { userId?: string; companyId?: string }) =>
    ["admin", "plans", params] as const,
  generatedPlan: (id: string) => ["admin", "plans", id] as const,

  analytics: ["admin", "analytics"] as const,

  systemStatus: ["admin", "system", "status"] as const,

  systemLogs: (params?: { level?: string; limit?: number }) =>
    ["admin", "system", "logs", params] as const,

  systemSettings: ["admin", "system", "settings"] as const,

  roles: ["admin", "roles"] as const,
  role: (id: string) => ["admin", "roles", id] as const,

  adminUsers: ["admin", "admin-users"] as const,
  adminUser: (id: string) => ["admin", "admin-users", id] as const,

  abuseFlags: (params?: { resolved?: boolean }) =>
    ["admin", "abuse", params] as const,

  companyPricing: (companyId: string) =>
    ["admin", "company-credits", "pricing", companyId] as const,
  companyCreditHistory: (companyId?: string) =>
    ["admin", "company-credits", "history", companyId] as const,
  planContexts: ["admin", "plan-contexts"] as const,
  blogPosts: (params?: PaginationParams) => ["admin", "blog-posts", params] as const,
  blogPost: (id: number) => ["admin", "blog-posts", id] as const,
  blogCategories: ["admin", "blog-categories"] as const,
  blogCategory: (id: number) => ["admin", "blog-categories", id] as const,
  ebooks: ["admin", "ebooks"] as const,
  ebookOrders: (ebookId?: number) => ["admin", "ebooks", "orders", ebookId] as const,
  ebookStats: ["admin", "ebooks", "stats"] as const,
  companyOnboarding: (status?: string) => ["admin", "company-onboarding", status] as const,
  companyOnboardingDetail: (id: number) => ["admin", "company-onboarding", id] as const,

  // Affiliate Management
  affiliateApplications: ["admin", "affiliates", "applications"] as const,
  affiliateApplication: (id: number) => ["admin", "affiliates", "applications", id] as const,
  affiliates: ["admin", "affiliates"] as const,
  affiliateStats: ["admin", "affiliates", "stats"] as const,
  affiliateDetail: (id: number) => ["admin", "affiliates", id] as const,
};

const extractData = <T>(response: { data: { data: T } }): T => {
  return response.data.data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => adminApi.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const response = await adminApi.getCurrentUser();
      return response.data.data;
    },
    enabled: !!getAuthCookie(),
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      return extractData(response);
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const response = await adminApi.getUsers();
      return extractData(response);
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      const response = await adminApi.getUser(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManagedUser>) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ManagedUser> }) => adminApi.updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) });
    },
  });
};

export const useResetUserCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      adminApi.resetUserCredits(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (id: string) => adminApi.resetUserPassword(id),
  });
};

export const useCompanies = () => {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => {
      const response = await adminApi.getCompanies();
      return extractData(response);
    },
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: queryKeys.company(id),
    queryFn: async () => {
      const response = await adminApi.getCompany(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCompanyEmployees = (id: string) => {
  return useQuery({
    queryKey: queryKeys.companyEmployees(id),
    queryFn: async () => {
      const response = await adminApi.getCompanyEmployees(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Company>) => adminApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) => adminApi.updateCompany(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: queryKeys.company(variables.id) });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useFreezeCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.freezeCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useUnfreezeCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unfreezeCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useAddCompanyCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      adminApi.addCompanyCredits(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
    },
  });
};

export const useSetCompanyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, planCode }: { id: string; planCode: string }) => adminApi.setCompanyPlan(id, planCode),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: queryKeys.company(variables.id) });
    },
  });
};

export const useCreditLedger = (params?: { userId?: string; companyId?: string }) => {
  return useQuery({
    queryKey: queryKeys.creditLedger(params),
    queryFn: async () => {
      const response = await adminApi.getCreditLedger(params);
      return extractData(response);
    },
  });
};

export const useAdjustCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreditAdjustment) => adminApi.adjustCredits(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useInvoices = () => {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: async () => {
      const response = await adminApi.getInvoices();
      return extractData(response);
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: async () => {
      const response = await adminApi.getInvoice(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Invoice>) => adminApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => adminApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.markInvoicePaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
};

export const useAILogs = (params?: { userId?: string; status?: string }) => {
  return useQuery({
    queryKey: queryKeys.aiLogs(params),
    queryFn: async () => {
      const response = await adminApi.getAILogs(params);
      return extractData(response);
    },
  });
};

export const useAILog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.aiLog(id),
    queryFn: async () => {
      const response = await adminApi.getAILog(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useFlagAILog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.flagAILog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiLogs() });
    },
  });
};

export const useGeneratedPlans = (params?: { userId?: string; companyId?: string }) => {
  return useQuery({
    queryKey: queryKeys.generatedPlans(params),
    queryFn: async () => {
      const response = await adminApi.getGeneratedPlans(params);
      return extractData(response);
    },
  });
};

export const useGeneratedPlan = (id: string) => {
  return useQuery({
    queryKey: queryKeys.generatedPlan(id),
    queryFn: async () => {
      const response = await adminApi.getGeneratedPlan(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generatedPlans() });
    },
  });
};

export const useArchivePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.archivePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generatedPlans() });
    },
  });
};

export const useFlagPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.flagPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.generatedPlans() });
    },
  });
};

export const usePlanContexts = () => {
  return useQuery({
    queryKey: queryKeys.planContexts,
    queryFn: async () => {
      const response = await adminApi.getPlanContexts();
      return extractData(response);
    },
  });
};

export const useUploadPlanContext = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) => adminApi.uploadPlanContext(title, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.planContexts });
    },
  });
};

export const useSetPlanContextActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => adminApi.setPlanContextActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.planContexts });
    },
  });
};

export const useDeletePlanContext = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePlanContext(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.planContexts });
    },
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      const response = await adminApi.getAnalytics();
      return extractData(response);
    },
  });
};

export const useSystemStatus = () => {
  return useQuery({
    queryKey: queryKeys.systemStatus,
    queryFn: async () => {
      const response = await adminApi.getSystemStatus();
      return extractData(response);
    },
    refetchInterval: 30000,
  });
};

export const useSystemLogs = (params?: { level?: string; limit?: number }) => {
  return useQuery({
    queryKey: queryKeys.systemLogs(params),
    queryFn: async () => {
      const response = await adminApi.getSystemLogs(params);
      return extractData(response);
    },
  });
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.systemSettings,
    queryFn: async () => {
      const response = await adminApi.getSystemSettings();
      return extractData(response);
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SystemSettings>) => adminApi.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings });
    },
  });
};

export const useToggleMaintenanceMode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.toggleMaintenanceMode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.systemSettings });
      queryClient.invalidateQueries({ queryKey: queryKeys.systemStatus });
    },
  });
};

export const useFetchLiveRates = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await adminApi.fetchLiveRates();
      return extractData(response);
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: async () => {
      const response = await adminApi.getRoles();
      return extractData(response);
    },
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: queryKeys.role(id),
    queryFn: async () => {
      const response = await adminApi.getRole(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminRole>) => adminApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminRole> }) => adminApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: async () => {
      const response = await adminApi.getAdminUsers();
      return extractData(response);
    },
  });
};

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: async () => {
      const response = await adminApi.getAdminUser(id);
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminUser>) => adminApi.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) => adminApi.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

export const useAbuseFlags = (params?: { resolved?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.abuseFlags(params),
    queryFn: async () => {
      const response = await adminApi.getAbuseFlags(params);
      return extractData(response);
    },
  });
};

export const useResolveAbuseFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.resolveAbuseFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abuseFlags() });
    },
  });
};

export const useCompanyPricing = (companyId: string) => {
  return useQuery({
    queryKey: queryKeys.companyPricing(companyId),
    queryFn: async () => {
      const response = await adminApi.getCompanyPricing(companyId);
      return response.data.data;
    },
    enabled: !!companyId,
  });
};

export const useCompanyCreditQuote = () => {
  return useMutation({
    mutationFn: ({ companyId, credits }: { companyId: string; credits: number }) =>
      adminApi.getCompanyCreditQuote(companyId, credits),
  });
};

export const useInitiateCompanyCreditPurchase = () => {
  return useMutation({
    mutationFn: ({ companyId, credits }: { companyId: string; credits: number }) =>
      adminApi.initiateCompanyCreditPurchase(companyId, credits),
  });
};

export const useVerifyCompanyCreditPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ txRef, transactionId }: { txRef: string; transactionId?: string }) =>
      adminApi.verifyCompanyCreditPurchase(txRef, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "company-credits"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditLedger() });
    },
  });
};

export const useCompanyCreditHistory = (companyId?: string) => {
  return useQuery({
    queryKey: queryKeys.companyCreditHistory(companyId),
    queryFn: async () => {
      const response = await adminApi.getCompanyCreditHistory(companyId);
      return response.data.data;
    },
    enabled: !!companyId,
  });
};

// ─── Blog Post Hooks ──────────────────────────────────────────

export const useAdminBlogPosts = (params?: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.blogPosts(params),
    queryFn: () => adminApi.getBlogPosts(params),
  });
};

export const useAdminBlogPost = (id: number) => {
  return useQuery({
    queryKey: queryKeys.blogPost(id),
    queryFn: () => adminApi.getBlogPost(id),
    enabled: id > 0,
  });
};

export const useAdminCreateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogPostRequest) => adminApi.createBlogPost(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] }),
  });
};

export const useAdminUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlogPostRequest }) =>
      adminApi.updateBlogPost(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPost(variables.id) });
    },
  });
};

export const useAdminDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteBlogPost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] }),
  });
};

export const useUploadBlogImage = () => {
  return useMutation({
    mutationFn: (file: File) => adminApi.uploadBlogImage(file),
  });
};

// ─── Blog Category Hooks ──────────────────────────────────────

export const useAdminBlogCategories = () => {
  return useQuery({
    queryKey: queryKeys.blogCategories,
    queryFn: () => adminApi.getBlogCategories(),
  });
};

export const useAdminCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogCategoryRequest) => adminApi.createBlogCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
  });
};

export const useAdminUpdateBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlogCategoryRequest }) =>
      adminApi.updateBlogCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
  });
};

export const useAdminDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteBlogCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blog-posts"] });
    },
  });
};

// ─── Ebook Hooks ──────────────────────────────────────────────

export const useAdminEbooks = () => {
  return useQuery({
    queryKey: queryKeys.ebooks,
    queryFn: () => adminApi.getEbooks(),
  });
};

export const useAdminEbookStats = () => {
  return useQuery({
    queryKey: queryKeys.ebookStats,
    queryFn: () => adminApi.getEbookStats(),
  });
};

export const useAdminEbookOrders = (ebookId: number) => {
  return useQuery({
    queryKey: queryKeys.ebookOrders(ebookId),
    queryFn: () => adminApi.getEbookOrders(ebookId),
    enabled: !!ebookId,
  });
};

export const useAdminAllEbookOrders = () => {
  return useQuery({
    queryKey: queryKeys.ebookOrders(),
    queryFn: () => adminApi.getAllEbookOrders(),
  });
};

export const useAdminCreateEbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEbookRequest) => adminApi.createEbook(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ebooks }),
  });
};

export const useAdminUpdateEbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEbookRequest }) =>
      adminApi.updateEbook(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ebooks }),
  });
};

export const useAdminDeleteEbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteEbook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ebooks }),
  });
};

export const useAdminAddVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ebookId, data }: { ebookId: number; data: CreateVersionRequest }) =>
      adminApi.addVersion(ebookId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ebooks }),
  });
};

export const useAdminUpdateVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ebookId, versionId, data }: { ebookId: number; versionId: number; data: UpdateVersionRequest }) =>
      adminApi.updateVersion(ebookId, versionId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ebooks }),
  });
};

export const useAdminDeleteVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ebookId, versionId }: { ebookId: number; versionId: number }) =>
      adminApi.deleteVersion(ebookId, versionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ebooks }),
  });
};

export const useUploadEbookPdf = () => {
  return useMutation({
    mutationFn: (file: File) => adminApi.uploadEbookPdf(file),
  });
};

// ============ Company Onboarding Hooks ============

export const useCompanyOnboardingRequests = (status?: string) => {
  return useQuery({
    queryKey: queryKeys.companyOnboarding(status),
    queryFn: () => adminApi.getCompanyOnboardingRequests(status),
  });
};

export const useCompanyOnboardingRequest = (id: number) => {
  return useQuery({
    queryKey: queryKeys.companyOnboardingDetail(id),
    queryFn: () => adminApi.getCompanyOnboardingRequest(id),
    enabled: id > 0,
  });
};

export const useApproveCompanyOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminEmail }: { id: number; adminEmail?: string }) =>
      adminApi.approveCompanyOnboarding(id, adminEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "company-onboarding"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies });
    },
  });
};

export const useRejectCompanyOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, adminEmail }: { id: number; reason: string; adminEmail?: string }) =>
      adminApi.rejectCompanyOnboarding(id, reason, adminEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "company-onboarding"] });
    },
  });
};

// ============ Doctor Management Hooks ============

export const useDoctorApplications = () => {
  return useQuery({
    queryKey: ["admin", "doctors", "applications"],
    queryFn: () => adminApi.getDoctorApplications(),
  });
};

export const useDoctors = () => {
  return useQuery({
    queryKey: ["admin", "doctors"],
    queryFn: () => adminApi.getDoctors(),
  });
};

export const useDoctorStats = () => {
  return useQuery({
    queryKey: ["admin", "doctors", "stats"],
    queryFn: () => adminApi.getDoctorStats(),
  });
};

export const useApproveDoctorApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, adminEmail }: { userId: number; adminEmail?: string }) =>
      adminApi.approveDoctorApplication(userId, adminEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });
};

export const useRejectDoctorApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason, adminEmail }: { userId: number; reason: string; adminEmail?: string }) =>
      adminApi.rejectDoctorApplication(userId, reason, adminEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });
};

export const useRevokeDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, adminEmail }: { userId: number; adminEmail?: string }) =>
      adminApi.revokeDoctor(userId, adminEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "doctors"] });
    },
  });
};

export const useCreditPlans = (companyId?: string) => {
  return useQuery({
    queryKey: ["admin", "credit-plans", companyId] as const,
    queryFn: () => adminApi.getCreditPlans(companyId),
  });
};

export const useCreateCustomCreditPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreditPlan>) => adminApi.createCustomCreditPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "credit-plans"] });
    },
  });
};

// ─── Affiliate Management ─────────────────────────────────────

export const useAffiliateApplications = () => {
  return useQuery({
    queryKey: queryKeys.affiliateApplications,
    queryFn: () => adminApi.getAffiliateApplications(),
  });
};

export const useAffiliateApplication = (id: number) => {
  return useQuery({
    queryKey: queryKeys.affiliateApplication(id),
    queryFn: () => adminApi.getAffiliateApplication(id),
    enabled: id > 0,
  });
};

export const useAffiliates = () => {
  return useQuery({
    queryKey: queryKeys.affiliates,
    queryFn: () => adminApi.getAffiliates(),
  });
};

export const useAffiliateStats = () => {
  return useQuery({
    queryKey: queryKeys.affiliateStats,
    queryFn: () => adminApi.getAffiliateStats(),
  });
};

export const useAffiliateDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.affiliateDetail(id),
    queryFn: () => adminApi.getAffiliateDetail(id),
    enabled: id > 0,
  });
};

export const useAffiliatePeriodStats = (id: number, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...queryKeys.affiliateDetail(id), "periodStats", startDate, endDate],
    queryFn: () => adminApi.getAffiliatePeriodStats(id, startDate, endDate),
    enabled: id > 0,
  });
};

export const useApproveAffiliateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.approveAffiliateApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateStats });
    },
  });
};

export const useRejectAffiliateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectAffiliateApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateStats });
    },
  });
};

export const useRequestAffiliateInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      adminApi.requestAffiliateInfo(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateApplications });
    },
  });
};

export const useSuspendAffiliate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.suspendAffiliate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateStats });
    },
  });
};

export const useActivateAffiliate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.activateAffiliate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateStats });
    },
  });
};

export const useUpdateAffiliateCommissionRate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rate }: { id: number; rate: number }) =>
      adminApi.updateAffiliateCommissionRate(id, rate),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliateDetail(variables.id) });
    },
  });
};

// ─── Affiliate Payout Management ─────────────────────────────

export const useAffiliatePayouts = (status?: string) => {
  return useQuery({
    queryKey: ["admin", "affiliates", "payouts", status],
    queryFn: () => adminApi.getAffiliatePayouts(status),
  });
};

export const useApproveAffiliatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payoutId: number) => adminApi.approveAffiliatePayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "payouts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
    },
  });
};

export const useRejectAffiliatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payoutId, reason }: { payoutId: number; reason: string }) =>
      adminApi.rejectAffiliatePayout(payoutId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "payouts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
    },
  });
};

export const useCompleteAffiliatePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payoutId: number) => adminApi.completeAffiliatePayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "affiliates", "payouts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.affiliates });
    },
  });
};
