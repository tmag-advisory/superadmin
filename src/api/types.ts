// API Response wrapper (matches Spring Boot SuccessResponse)
export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
}

// Auth
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: "super_admin" | "client_admin" | "support_admin";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  exp: number;
  user: AdminUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Users
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "individual" | "employee" | "hr_admin";
  planType: "individual" | "corporate";
  companyId?: string;
  companyName?: string;
  creditsUsed: number;
  creditsRemaining: number;
  plansGenerated: number;
  lastActivity: string;
  status: "active" | "suspended";
  riskFlags: string[];
  joinedAt: string;
  avatar?: string;
  location?: string;
  bio?: string;
}

// Companies
export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  creditsPurchased: number;
  creditsRemaining: number;
  plansGenerated: number;
  activeEmployees: number;
  billingStatus: "active" | "overdue" | "frozen";
  contractRenewal: string;
  tier: string;
  hrAdmins: string[];
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  billingCurrency?: "USD" | "NGN" | "EUR" | "GBP";
  createdAt: string;
}

// Credits
export interface CreditLedgerEntry {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  companyName?: string;
  action: "consume" | "admin_add" | "admin_deduct" | "refund" | "purchase" | "system_grant";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  triggeredBy: string;
  timestamp: string;
}

export interface CreditAdjustment {
  userId?: string;
  companyId?: string;
  amount: number;
  reason: string;
}

// AI Logs
export interface AIRequestLog {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  companyName?: string;
  destination: string;
  promptSummary: string;
  outputSummary: string;
  tokensUsed: number;
  planGenerationTokensUsed?: number;
  summaryGenerationTokensUsed?: number;
  processingTimeMs: number;
  status: "success" | "error" | "flagged";
  errorMessage?: string;
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
  modelUsed: string;
  creditConsumed: boolean;
}

// Plans
export interface GeneratedPlan {
  id: string;
  userId: string;
  userName: string;
  companyId?: string;
  companyName?: string;
  destination: string;
  duration: string;
  purpose: string;
  riskScore: number;
  vaccinations: string[];
  healthAlerts: string[];
  safetyAdvisories: string[];
  planJson?: string;
  status: "active" | "processing" | "failed" | "flagged" | "archived" | "deleted";
  createdAt: string;
  creditUsed: boolean;
}

export interface PlanGenerationContext {
  id: string;
  title: string;
  sourceType: string;
  fileName: string;
  contentType: string;
  storagePath: string;
  synthesizedText: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics
export interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalCreditsIssued: number;
  totalCreditsConsumed: number;
  aiRequestsToday: number;
  revenueOverview: number;
  revenueBaseCurrency: string;
  failedAICalls: number;
  systemHealthStatus: "healthy" | "degraded" | "down";
  activeUsersToday: number;
  newUsersThisWeek: number;
  /** Active travel plans in the system */
  totalTravelPlans?: number;
  /** Suspended (soft-deleted) user accounts */
  suspendedUsers?: number;
  /** Invoices not yet paid */
  pendingInvoicesCount?: number;
  /** Active employee records */
  totalEmployees?: number;
  /** Abuse flags awaiting review */
  unresolvedAbuseFlags?: number;
  /** AI request logs in the last 7 days */
  aiRequestsLast7Days?: number;
  /** Share of successful AI calls in the last 30 days (0–100) */
  aiSuccessRateLast30Days?: number;
  /** Tokens used on AI logs since midnight (server time) */
  tokensUsedToday?: number;
  /** AI logs with error status in the last 7 days */
  failedAiCallsLast7Days?: number;
  /** Affiliate commissions paid out */
  affiliateCommissionPaid?: number;
  /** Affiliate commissions pending payout */
  affiliateCommissionPending?: number;
  /** Active affiliate count */
  totalActiveAffiliates?: number;
}

export interface AnalyticsData {
  topDestinations: { name: string; count: number }[];
  avgCreditsPerUser: number;
  corporateVsIndividual: { corporate: number; individual: number };
  peakUsageTimes: { hour: number; requests: number }[];
  monthlyRequests: { month: string; requests: number; revenue: number }[];
  dailyActiveUsers: { day: string; users: number }[];
  creditUsageByType: { type: string; used: number; remaining: number }[];
  requestsByModel: { model: string; requests: number }[];
  riskDistribution: { risk: string; count: number }[];
}

// Billing
export interface Invoice {
  id: string;
  companyId?: string;
  companyName?: string;
  userId?: string;
  userName?: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "refunded";
  description: string;
  issuedAt: string;
  paidAt?: string;
  dueDate: string;
  paymentMethod?: string;
}

// System
export interface SystemSettings {
  defaultIndividualCredits: number;
  defaultCorporateCredits: number;
  aiModelVersion: string;
  planGenerationLimit: number;
  globalDisclaimer: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  maxEmployeesPerCompany: number;
  revenueBaseCurrency: string;
  exchangeRateNGN: number;
  exchangeRateEUR: number;
  exchangeRateGBP: number;
  exchangeRateINR: number;
  exchangeRateCAD: number;
  exchangeRateAUD: number;
  exchangeRateKES: number;
  exchangeRateZAR: number;
  exchangeRateGHS: number;
  exchangeRateJPY: number;
  exchangeRateBRL: number;
  exchangeRateAED: number;
  exchangeRateSGD: number;
  exchangeRateCHF: number;
}

export interface SystemLog {
  id: string;
  level: "info" | "warning" | "error" | "critical";
  message: string;
  source: string;
  timestamp: string;
  details?: string;
}

export interface SystemStatus {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  services: {
    name: string;
    status: "healthy" | "degraded" | "down";
    latency?: number;
  }[];
  lastChecked: string;
}

// Roles & Permissions
export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

// Abuse
export interface AbuseFlag {
  id: string;
  userId: string;
  userName: string;
  type: "rapid_generation" | "credit_bypass" | "spam" | "suspicious_query";
  description: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

// Company Credit Purchase
export interface CompanyPricing {
  companyId: string;
  companyName: string;
  currency: "USD" | "NGN" | "EUR" | "GBP";
  currencySymbol: string;
  pricePerCredit: number;
  appliedTier: string;
  qualifiesForContactSales: boolean;
  standardTier1Price: number;
  standardTier2Price: number;
  standardTier3Price: number;
  premiumTier1Price: number;
  premiumTier2Price: number;
  premiumTier3Price: number;
  tier1MaxCredits: number;
  tier2MaxCredits: number;
  tier3MaxCredits: number;
}

export interface CompanyCreditQuote {
  companyId: string;
  companyName: string;
  credits: number;
  basePrice: number;
  totalAmount: number;
  currency: "USD" | "NGN" | "EUR" | "GBP";
  currencySymbol: string;
  pricePerCredit: number;
  appliedTier: string | null;
  qualifiesForContactSales: boolean;
}

export interface CompanyCreditPurchase {
  id: string;
  txRef: string;
  flwRef: string | null;
  userId: string;
  companyId: string | null;
  creditsPurchased: number;
  currency: "USD" | "NGN" | "EUR" | "GBP";
  currencySymbol: string;
  pricePerCredit: number;
  amount: number;
  amountPaid: number | null;
  status: string;
  flutterwaveStatus: string | null;
  paidAt: string | null;
  failedAt: string | null;
  failedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePurchaseResponse {
  txRef: string;
  paymentLink: string;
  credits: number;
  amount: number;
  currency: string;
  currencySymbol: string;
  purchaseId: string;
}

// ─── HR Management ────────────────────────────────────────────

export interface HREmployee {
  id: number;
  name: string;
  email: string;
  department: string;
  creditsUsed: number;
  creditsAllocated: number;
  status: "active" | "inactive";
  plansGenerated: number;
  companyId: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HRCreateEmployeeRequest {
  name: string;
  email: string;
  department: string;
  creditsAllocated: number;
  status: "active" | "inactive";
  company_id: number;
  creditsUsed?: number;
  plansGenerated?: number;
}

export interface HRTravelRequest {
  id: number;
  destination: string;
  dates: string;
  status: "pending" | "approved" | "rejected" | "completed";
  submittedAt?: string;
  companyId?: number;
  employeeId?: number;
  employeeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HRCreditLedgerEntry {
  id: number;
  amount: number;
  balanceAfter: number;
  type: string;
  reference: string;
  companyId?: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Ebooks ───────────────────────────────────────────────────

export interface AdminEbookVersion {
  id: number;
  label: string;
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  price: number;
  currency: string;
  currencySymbol: string;
  fileUrl: string | null;
  fileKey: string | null;
  fileSizeMb: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminEbook {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  author: string;
  authorBio: string | null;
  coverUrl: string | null;
  previewUrl: string | null;
  pageCount: number | null;
  publishedYear: number | null;
  isbn: string | null;
  isActive: boolean;
  isFeatured: boolean;
  versions: AdminEbookVersion[];
  createdAt: string;
}

export interface AdminEbookOrder {
  id: number;
  txRef: string;
  status: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string | null;
  isGuest: boolean;
  userId: number | null;
  ebookId: number;
  ebookTitle: string;
  ebookSlug: string;
  versionLabel: string;
  countryName: string | null;
  amount: number;
  amountPaid: number | null;
  currency: string;
  currencySymbol: string;
  emailSent: boolean;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminEbookStats {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalEbooks: number;
}

export interface CreateEbookRequest {
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  author: string;
  authorBio?: string;
  coverUrl?: string;
  previewUrl?: string;
  pageCount?: number;
  publishedYear?: number;
  isbn?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export type UpdateEbookRequest = Partial<CreateEbookRequest>;

export interface CreateVersionRequest {
  label: string;
  countryCode?: string;
  countryName?: string;
  region?: string;
  price: number;
  currency: string;
  currencySymbol: string;
  fileUrl?: string;
  fileKey?: string;
  fileSizeMb?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateVersionRequest = Partial<CreateVersionRequest>;

// ============ Company Onboarding ============

export interface AdminOnboardingTeamMember {
  name: string;
  email: string;
  role: string;
}

export interface AdminOnboardingPlatformEmployee {
  email: string;
  name?: string;
}

export interface CompanyOnboardingRequest {
  id: number;
  companyName: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  billingCurrency: string;
  selectedPlanCode: string;
  creditCount?: number;
  sampleRequest: string;
  teamMembers: AdminOnboardingTeamMember[];
  platformEmployees?: AdminOnboardingPlatformEmployee[];
  teamMembersCsvFileName?: string | null;
  teamMembersCsvUrl?: string | null;
  txRef: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentCurrency: string;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdCompanyId: number | null;
  createdAt: string;
  updatedAt: string;
  seatCount?: number | null;
  billingModel?: string | null;
  msaDocumentFileName?: string | null;
  msaDocumentUrl?: string | null;
}

// ─── Doctor Management ───────────────────────────────────────

export interface AdminDoctorApplicationDto {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string;
  applicationStatus: string;
  applicationSubmittedAt: string;
  identityDocumentUrl: string | null;
  licenseDocumentUrl: string | null;
  profilePictureUrl?: string | null;
  practicingLicenseUrl?: string | null;
  travelMedicineCertificateUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface AdminDoctorListItemDto {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string;
  profilePictureUrl?: string | null;
  practicingLicenseUrl?: string | null;
  travelMedicineCertificateUrl?: string | null;
  bio?: string | null;
  validatedPlansCount: number;
  createdAt: string;
}

export interface AdminDoctorStats {
  totalDoctors: number;
  pendingApplications: number;
  approvedToday: number;
  totalValidatedPlans: number;
}

// ─── Elevated Plans ───────────────────────────────────────

export interface EscalatedPlan {
  id: string;
  destination: string;
  duration: string;
  purpose: string;
  riskScore: number;
  travellerName: string;
  travellerEmail: string;
  reviewDoctorName: string;
  doctorFeedback: string;
  pdfPreviewUrl?: string | null;
  summaryPreviewUrl?: string | null;
  escalatedAt: string;
  assignedDoctors?: { doctorId: number; firstName?: string; lastName?: string; email?: string; profilePictureUrl?: string }[];
  openToAllDoctors?: boolean;
}

export interface CreditPlan {
  id: number;
  code: string;
  displayName: string;
  basePriceUsd: number;
  basePriceNgn: number | null;
  description: string;
  isDefault: boolean;
  isCompanyPlan: boolean;
  signupRangeLabel: string | null;
  serviceLevel: "STANDARD" | "PREMIUM" | null;
  visibility: "PUBLIC" | "CUSTOM";
  assignedCompanyId?: number | null;
  planCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

// Affiliate Management
export interface AffiliateApplication {
  id: number;
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  websiteUrl?: string;
  socialMediaLinks?: string;
  estimatedMonthlyReach?: string;
  promoDescription: string;
  agreedToTerms: boolean;
  status: "pending" | "approved" | "rejected" | "info_requested";
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface AdminAffiliate {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  referralCode: string;
  commissionRate: string;
  discountRate: string;
  totalClicks: number;
  totalConversions: number;
  totalCommissionEarned: string;
  totalPaidOut: string;
  pendingCommission: string;
  status: "active" | "suspended" | "pending";
  createdAt: string;
}

export interface AdminAffiliateDetail extends AdminAffiliate {
  totalCommissionEarnedNgn: string;
  totalPaidOutNgn: string;
  pendingCommissionNgn: string;
  referrals: AdminAffiliateReferral[];
  commissions: AdminAffiliateCommission[];
  payouts: AdminAffiliatePayout[];
}

export interface AdminAffiliateReferral {
  id: number;
  referredUserName: string;
  referredUserEmail: string;
  referralCode: string;
  status: string;
  convertedAt?: string;
  createdAt: string;
}

export interface AdminAffiliateCommission {
  id: number;
  amount: string;
  baseAmount: string;
  rate: string;
  status: string;
  currency: string;
  customerEmail?: string;
  referenceType: string;
  referenceId?: number;
  campaign?: string;
  createdAt: string;
}

export interface AdminAffiliatePayout {
  id: number;
  amount: string;
  currency: string;
  paymentMethod: string;
  paymentDetails?: string;
  status: string;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
  affiliateId?: number;
  affiliateName?: string;
  affiliateEmail?: string;
  referralCode?: string;
}

export interface AdminAffiliateStats {
  totalActiveAffiliates: number;
  totalPendingApplications: number;
  totalCommissionPaid: string;
  totalCommissionPending: string;
  totalRevenue?: string;
  conversionRate: number;
  totalClicks: number;
  totalConversions: number;
  clicksChart?: Array<{
    date: string;
    clicks: number;
    conversions: number;
  }>;
  topAffiliates: Array<{
    id: number;
    userName: string;
    commissionEarned: string | number;
    commissionEarnedNgn: string | number;
    conversions: number;
  }>;
}
export interface AffiliatePeriodStats {
  clicks?: number;
  conversions?: number;
  commissionEarnedUsd?: string | number;
  commissionEarnedNgn?: string | number;
}
