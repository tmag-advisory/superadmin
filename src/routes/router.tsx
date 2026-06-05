import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";

// ---------------------------------------------------------------------------
// Route-level code splitting — each page loads only when first visited.
// AdminLayout is kept eager so the shell renders immediately on auth'd routes.
// LoginPage is kept small and loaded on first paint of /admin.
// ---------------------------------------------------------------------------
const LoginPage               = lazy(() => import("../pages/auth/LoginPage"));
const Dashboard               = lazy(() => import("../pages/dashboard/Dashboard"));
const UsersPage               = lazy(() => import("../pages/users/UsersPage"));
const UserDetailPage          = lazy(() => import("../pages/users/UserDetailPage"));
const CompaniesPage           = lazy(() => import("../pages/companies/CompaniesPage"));
const CompanyDetailPage       = lazy(() => import("../pages/companies/CompanyDetailPage"));
const CreditsPage             = lazy(() => import("../pages/credits/CreditsPage"));
const AILogsPage              = lazy(() => import("../pages/ai-logs/AILogsPage"));
const PlansPage               = lazy(() => import("../pages/plans/PlansPage"));
const EscalatedPlansPage      = lazy(() => import("../pages/plans/EscalatedPlansPage"));
const CreditPlansPage         = lazy(() => import("../pages/credit-plans/CreditPlansPage"));
const AnalyticsPage           = lazy(() => import("../pages/analytics/AnalyticsPage"));
const BillingPage             = lazy(() => import("../pages/billing/BillingPage"));
const RolesPage               = lazy(() => import("../pages/roles/RolesPage"));
const AdminUsersPage          = lazy(() => import("../pages/admin-users/AdminUsersPage"));
const SystemStatusPage        = lazy(() => import("../pages/system/SystemStatusPage"));
const SystemLogsPage          = lazy(() => import("../pages/system/SystemLogsPage"));
const SystemSettingsPage      = lazy(() => import("../pages/system/SystemSettingsPage"));
const AbusePage               = lazy(() => import("../pages/settings/AbusePage"));
const PlanContextsPage        = lazy(() => import("../pages/settings/PlanContextsPage"));
const EbooksPage              = lazy(() => import("../pages/ebooks/EbooksPage"));
const EbookCreatePage         = lazy(() => import("../pages/ebooks/EbookCreatePage"));
const EbookEditPage           = lazy(() => import("../pages/ebooks/EbookEditPage"));
const EbookDetailPage         = lazy(() => import("../pages/ebooks/EbookDetailPage"));
const CompanyOnboardingPage   = lazy(() => import("../pages/company-onboarding/CompanyOnboardingPage"));
const DoctorsPage             = lazy(() => import("../pages/doctors/DoctorsPage"));
const AffiliatesPage          = lazy(() => import("../pages/affiliates/AffiliatesPage"));
const AffiliateDetailPage     = lazy(() => import("../pages/affiliates/AffiliateDetailPage"));
const BlogPostsPage           = lazy(() => import("../pages/blog/BlogPostsPage"));
const BlogPostCreatePage      = lazy(() => import("../pages/blog/BlogPostCreatePage"));
const BlogCategoriesPage      = lazy(() => import("../pages/blog/BlogCategoriesPage"));
const BlogPostEditPage        = lazy(() => import("../pages/blog/BlogPostEditPage"));
const ChangePasswordPage      = lazy(() => import("../pages/auth/ChangePasswordPage"));
const DeletionRequestsPage    = lazy(() => import("../pages/deletion-requests/DeletionRequestsPage"));
const TravelPlanDeletionsPage = lazy(() => import("../pages/travel-plan-deletions/TravelPlanDeletionsPage"));
const PrivacyPoliciesPage     = lazy(() => import("../pages/privacy-policies/PrivacyPoliciesPage"));

// Minimal fallback — intentionally no spinner library to avoid a chunk dep.
const PageFallback = (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-40" />
  </div>
);


export const router = createBrowserRouter([
  {
    path: "/admin",
    children: [
      /* Login — standalone, no sidebar */
      { index: true, element: <Suspense fallback={PageFallback}><LoginPage /></Suspense> },

      /* Forced password change — standalone (session cookie required, no sidebar) */
      { path: "change-password", element: <Suspense fallback={PageFallback}><ChangePasswordPage /></Suspense> },

      /* All authenticated routes share AdminLayout */
      {
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <Suspense fallback={PageFallback}><Dashboard /></Suspense> },

          /* Users */
          { path: "users", element: <Suspense fallback={PageFallback}><UsersPage /></Suspense> },
          { path: "users/:id", element: <Suspense fallback={PageFallback}><UserDetailPage /></Suspense> },
          { path: "users/:id/:tab", element: <Suspense fallback={PageFallback}><UserDetailPage /></Suspense> },

          /* Companies */
          { path: "companies", element: <Suspense fallback={PageFallback}><CompaniesPage /></Suspense> },
          { path: "companies/:id", element: <Suspense fallback={PageFallback}><CompanyDetailPage /></Suspense> },
          { path: "companies/:id/:tab", element: <Suspense fallback={PageFallback}><CompanyDetailPage /></Suspense> },

          /* Ledger */
          { path: "ledger", element: <Suspense fallback={PageFallback}><CreditsPage /></Suspense> },
          { path: "ledger/:transactionId", element: <Suspense fallback={PageFallback}><CreditsPage /></Suspense> },

          /* AI Logs */
          { path: "ai-logs", element: <Suspense fallback={PageFallback}><AILogsPage /></Suspense> },
          { path: "ai-logs/failures", element: <Suspense fallback={PageFallback}><AILogsPage /></Suspense> },
          { path: "ai-logs/flagged", element: <Suspense fallback={PageFallback}><AILogsPage /></Suspense> },
          { path: "ai-logs/high-usage", element: <Suspense fallback={PageFallback}><AILogsPage /></Suspense> },
          { path: "ai-logs/:logId", element: <Suspense fallback={PageFallback}><AILogsPage /></Suspense> },

          /* Plans */
          { path: "plans", element: <Suspense fallback={PageFallback}><PlansPage /></Suspense> },
          { path: "plans/:planId", element: <Suspense fallback={PageFallback}><PlansPage /></Suspense> },
          { path: "plans/:planId/archive", element: <Suspense fallback={PageFallback}><PlansPage /></Suspense> },
          { path: "plans/:planId/delete", element: <Suspense fallback={PageFallback}><PlansPage /></Suspense> },
          { path: "escalated-plans", element: <Suspense fallback={PageFallback}><EscalatedPlansPage /></Suspense> },
          { path: "credit-plans", element: <Suspense fallback={PageFallback}><CreditPlansPage /></Suspense> },

          /* Analytics */
          { path: "analytics", element: <Suspense fallback={PageFallback}><AnalyticsPage /></Suspense> },
          { path: "analytics/usage", element: <Suspense fallback={PageFallback}><AnalyticsPage /></Suspense> },
          { path: "analytics/destinations", element: <Suspense fallback={PageFallback}><AnalyticsPage /></Suspense> },
          { path: "analytics/credits", element: <Suspense fallback={PageFallback}><AnalyticsPage /></Suspense> },
          { path: "analytics/revenue", element: <Suspense fallback={PageFallback}><AnalyticsPage /></Suspense> },

          /* System */
          { path: "system/status", element: <Suspense fallback={PageFallback}><SystemStatusPage /></Suspense> },
          { path: "system/logs", element: <Suspense fallback={PageFallback}><SystemLogsPage /></Suspense> },
          { path: "system/settings", element: <Suspense fallback={PageFallback}><SystemSettingsPage /></Suspense> },
          { path: "abuse", element: <Suspense fallback={PageFallback}><AbusePage /></Suspense> },
          { path: "plan-contexts", element: <Suspense fallback={PageFallback}><PlanContextsPage /></Suspense> },

          /* Billing */
          { path: "billing", element: <Suspense fallback={PageFallback}><BillingPage /></Suspense> },
          { path: "billing/:invoiceId", element: <Suspense fallback={PageFallback}><BillingPage /></Suspense> },

          /* Access Control */
          { path: "roles", element: <Suspense fallback={PageFallback}><RolesPage /></Suspense> },
          { path: "roles/:roleId", element: <Suspense fallback={PageFallback}><RolesPage /></Suspense> },
          { path: "admin-users", element: <Suspense fallback={PageFallback}><AdminUsersPage /></Suspense> },
          { path: "admin-users/:adminId", element: <Suspense fallback={PageFallback}><AdminUsersPage /></Suspense> },

          /* Blog */
          { path: "blog", element: <Suspense fallback={PageFallback}><BlogPostsPage /></Suspense> },
          { path: "blog/categories", element: <Suspense fallback={PageFallback}><BlogCategoriesPage /></Suspense> },
          { path: "blog/create", element: <Suspense fallback={PageFallback}><BlogPostCreatePage /></Suspense> },
          { path: "blog/:id/edit", element: <Suspense fallback={PageFallback}><BlogPostEditPage /></Suspense> },

          /* Ebooks */
          { path: "ebooks", element: <Suspense fallback={PageFallback}><EbooksPage /></Suspense> },
          { path: "ebooks/create", element: <Suspense fallback={PageFallback}><EbookCreatePage /></Suspense> },
          { path: "ebooks/:id", element: <Suspense fallback={PageFallback}><EbookDetailPage /></Suspense> },
          { path: "ebooks/:id/edit", element: <Suspense fallback={PageFallback}><EbookEditPage /></Suspense> },

          /* Company Onboarding */
          { path: "company-registrations", element: <Suspense fallback={PageFallback}><CompanyOnboardingPage /></Suspense> },

          /* Doctors */
          { path: "doctors", element: <Suspense fallback={PageFallback}><DoctorsPage /></Suspense> },

          /* Affiliates */
          { path: "affiliates", element: <Suspense fallback={PageFallback}><AffiliatesPage /></Suspense> },
          { path: "affiliates/:id", element: <Suspense fallback={PageFallback}><AffiliateDetailPage /></Suspense> },

          /* Security & Privacy */
          { path: "deletion-requests", element: <Suspense fallback={PageFallback}><DeletionRequestsPage /></Suspense> },
          { path: "travel-plan-deletions", element: <Suspense fallback={PageFallback}><TravelPlanDeletionsPage /></Suspense> },
          { path: "privacy-policies", element: <Suspense fallback={PageFallback}><PrivacyPoliciesPage /></Suspense> },

          /* Catch-all */
          {
            path: "*",
            element: (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h1 className="text-4xl font-serif text-heading mb-2">404</h1>
                  <p className="text-muted">Page not found</p>
                </div>
              </div>
            ),
          },
        ],
      },
    ],
  },

  /* Root redirect */
  { path: "/", element: <Navigate to="/admin" replace /> },
  { path: "*", element: <Navigate to="/admin" replace /> },
]);
