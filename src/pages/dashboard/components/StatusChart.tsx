import { useMemo } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const CHART_COLORS = {
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  danger: 'hsl(0, 84%, 60%)',
  gray: 'hsl(0, 0%, 45%)',
}

const statusChartConfig = {
  active: { label: 'Aktif', color: CHART_COLORS.success },
  pending: { label: 'Pending', color: CHART_COLORS.warning },
  lapsed: { label: 'Lapsed', color: CHART_COLORS.danger },
  terminated: { label: 'Berakhir', color: CHART_COLORS.gray },
} satisfies ChartConfig

interface StatusChartProps {
  stats: {
    active: number
    pending: number
    lapsed: number
    terminated: number
  } | null
}

export function StatusChart({ stats }: StatusChartProps) {
  const chartData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'active', value: stats.active, fill: statusChartConfig.active.color },
      { name: 'pending', value: stats.pending, fill: statusChartConfig.pending.color },
      { name: 'lapsed', value: stats.lapsed, fill: statusChartConfig.lapsed.color },
      { name: 'terminated', value: stats.terminated, fill: statusChartConfig.terminated.color },
    ].filter(item => item.value > 0)
  }, [stats])

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Status Polis</CardTitle>
        <CardDescription>Distribusi status polis saat ini</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={statusChartConfig} className="mx-auto h-[200px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            />
          </PieChart>
        </ChartContainer>
        {/* Custom Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {statusChartConfig[item.name as keyof typeof statusChartConfig]?.label}
              </span>
              <span className="ml-auto text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
