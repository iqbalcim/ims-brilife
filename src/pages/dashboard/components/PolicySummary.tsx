import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PolicySummaryProps {
  stats: {
    total: number
    active: number
    pending: number
    lapsed: number
    terminated: number
    totalPremium: number
    totalSumAssured: number
  } | null
}

export function PolicySummary({ stats }: PolicySummaryProps) {
  const activePercentage = stats
    ? Math.round((stats.active / stats.total) * 100)
    : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Ringkasan Polis</CardTitle>
        <CardDescription>Statistik detail status polis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Polis Aktif</span>
              <span className="text-sm text-muted-foreground">
                {stats?.active || 0} dari {stats?.total || 0}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${activePercentage}%` }}
              />
            </div>
          </div>

          {/* Detail Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats?.active || 0}</p>
              <p className="text-sm text-muted-foreground">Aktif</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{stats?.lapsed || 0}</p>
              <p className="text-sm text-muted-foreground">Lapsed</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">{stats?.terminated || 0}</p>
              <p className="text-sm text-muted-foreground">Berakhir</p>
            </div>
          </div>

          {/* Total Values */}
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Premi Aktif</span>
              <span className="font-semibold">{formatCurrency(stats?.totalPremium || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Uang Pertanggungan</span>
              <span className="font-semibold">{formatCurrency(stats?.totalSumAssured || 0)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
