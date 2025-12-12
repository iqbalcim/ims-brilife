import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface Stats {
  total: number
  active: number
  pending: number
  lapsed: number
  terminated: number
  totalPremium: number
  totalSumAssured: number
  byProductCode: Record<string, number>
}

interface InsuredStats {
  total: number
  active: number
  inactive: number
  byGender: { male: number; female: number }
  smokers: number
  withChronicIllness: number
}

// Label produk dalam Bahasa Indonesia
const productLabels: Record<string, string> = {
  WHOLE_LIFE: 'Jiwa Seumur Hidup',
  TERM_LIFE: 'Jiwa Berjangka',
  UNIT_LINK: 'Unit Link',
  ENDOWMENT: 'Endowment',
  HEALTH: 'Kesehatan',
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function DashboardPage() {
  const [policyStats, setPolicyStats] = useState<Stats | null>(null)
  const [insuredStats, setInsuredStats] = useState<InsuredStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [policyRes, insuredRes] = await Promise.all([
          fetch('/api/policies/stats'),
          fetch('/api/insured-persons/stats'),
        ])

        const policyData = await policyRes.json()
        const insuredData = await insuredRes.json()

        if (policyData.success) setPolicyStats(policyData.data)
        if (insuredData.success) setInsuredStats(insuredData.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare chart data for product distribution
  const productChartData = useMemo(() => {
    if (!policyStats?.byProductCode) return []
    return Object.entries(policyStats.byProductCode).map(([code, count]) => ({
      name: productLabels[code] || code,
      value: count,
    }))
  }, [policyStats])

  // Prepare chart data for policy status
  const statusChartData = useMemo(() => {
    if (!policyStats) return []
    return [
      { name: 'Aktif', value: policyStats.active, fill: '#22c55e' },
      { name: 'Pending', value: policyStats.pending, fill: '#eab308' },
      { name: 'Lapsed', value: policyStats.lapsed, fill: '#f97316' },
      { name: 'Berakhir', value: policyStats.terminated, fill: '#ef4444' },
    ].filter(item => item.value > 0)
  }, [policyStats])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Selamat datang di BRI Life Insurance Management System
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policyStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{policyStats?.active || 0} aktif</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tertanggung</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insuredStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{insuredStats?.active || 0} aktif</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premi Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(policyStats?.totalPremium || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Per bulan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uang Pertanggungan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(policyStats?.totalSumAssured || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Policy Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Polis</CardTitle>
            <CardDescription>Distribusi status polis saat ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Aktif</span>
              </div>
              <Badge variant="default" className="bg-green-600">
                {policyStats?.active || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Pending</span>
              </div>
              <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                {policyStats?.pending || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Lapsed</span>
              </div>
              <Badge variant="outline" className="border-orange-600 text-orange-600">
                {policyStats?.lapsed || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Berakhir</span>
              </div>
              <Badge variant="destructive">
                {policyStats?.terminated || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Produk</CardTitle>
            <CardDescription>Jumlah polis per jenis produk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {productChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tertanggung Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Tertanggung</CardTitle>
          <CardDescription>Informasi demografis tertanggung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insuredStats?.byGender?.male || 0}
              </div>
              <p className="text-xs text-muted-foreground">Laki-laki</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">
                {insuredStats?.byGender?.female || 0}
              </div>
              <p className="text-xs text-muted-foreground">Perempuan</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {insuredStats?.smokers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Perokok</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {insuredStats?.withChronicIllness || 0}
              </div>
              <p className="text-xs text-muted-foreground">Penyakit Kronis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
