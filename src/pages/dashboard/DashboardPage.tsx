import { useEffect } from 'react'
import { Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { usePolicy, useInsuredPerson } from '@/hooks'
import {
  StatsCards,
  StatusChart,
  ProductChart,
  GenderChart,
  HealthStats,
  PolicySummary,
} from './components'

export function DashboardPage() {
  const { stats: policyStats, fetchStats: fetchPolicyStats, isLoading: policyLoading } = usePolicy()
  const { stats: insuredStats, fetchStats: fetchInsuredStats, isLoading: insuredLoading } = useInsuredPerson()

  const loading = policyLoading || insuredLoading || (!policyStats && !insuredStats)

  useEffect(() => {
    fetchPolicyStats()
    fetchInsuredStats()
  }, [fetchPolicyStats, fetchInsuredStats])

  if (loading && !policyStats && !insuredStats) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-muted-foreground">
            Selamat datang di BRI Life Insurance Management System
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span>Live Data</span>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards policyStats={policyStats} insuredStats={insuredStats} loading={loading} />

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <StatusChart stats={policyStats} />
        <ProductChart byProductCode={policyStats?.byProductCode} />
        <GenderChart byGender={insuredStats?.byGender} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <HealthStats stats={insuredStats} />
        <PolicySummary stats={policyStats} />
      </div>
    </div>
  )
}
