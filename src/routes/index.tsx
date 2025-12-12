import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { MainLayout, AuthGuard } from '@/components/layout'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const PolicyListPage = lazy(() => import('@/pages/policy/PolicyListPage').then(m => ({ default: m.PolicyListPage })))
const PolicyFormPage = lazy(() => import('@/pages/policy/PolicyFormPage').then(m => ({ default: m.PolicyFormPage })))
const PolicyDetailPage = lazy(() => import('@/pages/policy/PolicyDetailPage').then(m => ({ default: m.PolicyDetailPage })))
const InsuredPersonListPage = lazy(() => import('@/pages/insured-person/InsuredPersonListPage').then(m => ({ default: m.InsuredPersonListPage })))
const InsuredPersonFormPage = lazy(() => import('@/pages/insured-person/InsuredPersonFormPage').then(m => ({ default: m.InsuredPersonFormPage })))
const InsuredPersonDetailPage = lazy(() => import('@/pages/insured-person/InsuredPersonDetailPage').then(m => ({ default: m.InsuredPersonDetailPage })))
const PremiumPaymentListPage = lazy(() => import('@/pages/premium-payment/PremiumPaymentListPage').then(m => ({ default: m.PremiumPaymentListPage })))
const PremiumPaymentFormPage = lazy(() => import('@/pages/premium-payment/PremiumPaymentFormPage').then(m => ({ default: m.PremiumPaymentFormPage })))
const PremiumPaymentDetailPage = lazy(() => import('@/pages/premium-payment/PremiumPaymentDetailPage').then(m => ({ default: m.PremiumPaymentDetailPage })))
const AgentListPage = lazy(() => import('@/pages/agent/AgentListPage').then(m => ({ default: m.AgentListPage })))
const AgentFormPage = lazy(() => import('@/pages/agent/AgentFormPage').then(m => ({ default: m.AgentFormPage })))
const AgentDetailPage = lazy(() => import('@/pages/agent/AgentDetailPage').then(m => ({ default: m.AgentDetailPage })))

function PageLoader() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>,
      },
      // Policy
      { path: 'policies', element: <Suspense fallback={<PageLoader />}><PolicyListPage /></Suspense> },
      { path: 'policies/new', element: <Suspense fallback={<PageLoader />}><PolicyFormPage /></Suspense> },
      { path: 'policies/:id', element: <Suspense fallback={<PageLoader />}><PolicyDetailPage /></Suspense> },
      { path: 'policies/:id/edit', element: <Suspense fallback={<PageLoader />}><PolicyFormPage /></Suspense> },
      // Insured Person
      { path: 'insured-persons', element: <Suspense fallback={<PageLoader />}><InsuredPersonListPage /></Suspense> },
      { path: 'insured-persons/new', element: <Suspense fallback={<PageLoader />}><InsuredPersonFormPage /></Suspense> },
      { path: 'insured-persons/:id', element: <Suspense fallback={<PageLoader />}><InsuredPersonDetailPage /></Suspense> },
      { path: 'insured-persons/:id/edit', element: <Suspense fallback={<PageLoader />}><InsuredPersonFormPage /></Suspense> },
      // Premium Payment
      { path: 'premium-payments', element: <Suspense fallback={<PageLoader />}><PremiumPaymentListPage /></Suspense> },
      { path: 'premium-payments/create', element: <Suspense fallback={<PageLoader />}><PremiumPaymentFormPage /></Suspense> },
      { path: 'premium-payments/:id', element: <Suspense fallback={<PageLoader />}><PremiumPaymentDetailPage /></Suspense> },
      { path: 'premium-payments/:id/edit', element: <Suspense fallback={<PageLoader />}><PremiumPaymentFormPage /></Suspense> },
      // Agent
      { path: 'agents', element: <Suspense fallback={<PageLoader />}><AgentListPage /></Suspense> },
      { path: 'agents/new', element: <Suspense fallback={<PageLoader />}><AgentFormPage /></Suspense> },
      { path: 'agents/:id', element: <Suspense fallback={<PageLoader />}><AgentDetailPage /></Suspense> },
      { path: 'agents/:id/edit', element: <Suspense fallback={<PageLoader />}><AgentFormPage /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

// End of router
export function AppRouter() {
  return <RouterProvider router={router} />
}
