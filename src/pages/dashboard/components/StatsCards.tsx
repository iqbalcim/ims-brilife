import {
  FileText,
  Users,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardsProps {
  policyStats: {
    total: number
    active: number
    totalPremium: number
    totalSumAssured: number
  } | null
  insuredStats: {
    total: number
    active: number
  } | null
}

export function StatsCards({ policyStats, insuredStats }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(1)}M`
    }
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)}Jt`
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const activePercentage = policyStats
    ? Math.round((policyStats.active / policyStats.total) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Polis */}
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Total Polis</CardTitle>
          <FileText className="h-5 w-5 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{policyStats?.total || 0}</div>
          <div className="mt-1 flex items-center gap-1 text-sm text-blue-100">
            <ArrowUpRight className="h-4 w-4" />
            <span>{activePercentage}% aktif</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Tertanggung */}
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">Total Tertanggung</CardTitle>
          <Users className="h-5 w-5 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{insuredStats?.total || 0}</div>
          <div className="mt-1 flex items-center gap-1 text-sm text-purple-100">
            <CheckCircle2 className="h-4 w-4" />
            <span>{insuredStats?.active || 0} aktif</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Premi Aktif */}
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-100">Total Premi Aktif</CardTitle>
          <TrendingUp className="h-5 w-5 text-emerald-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(policyStats?.totalPremium || 0)}</div>
          <div className="mt-1 text-sm text-emerald-100">Per bulan</div>
        </CardContent>
      </Card>

      {/* Uang Pertanggungan */}
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-100">Uang Pertanggungan</CardTitle>
          <BarChart3 className="h-5 w-5 text-amber-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(policyStats?.totalSumAssured || 0)}</div>
          <div className="mt-1 text-sm text-amber-100">Total coverage</div>
        </CardContent>
      </Card>
    </div>
  )
}
