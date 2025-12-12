import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const CHART_COLORS = {
  primary: 'hsl(221, 83%, 53%)',
  secondary: 'hsl(262, 83%, 58%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(199, 89%, 48%)',
}

const productLabels: Record<string, string> = {
  WHOLE_LIFE: 'Seumur Hidup',
  TERM_LIFE: 'Berjangka',
  UNIT_LINK: 'Unit Link',
  ENDOWMENT: 'Endowment',
  HEALTH: 'Kesehatan',
}

const productChartConfig = {
  value: { label: 'Jumlah Polis' },
  WHOLE_LIFE: { label: 'Seumur Hidup', color: CHART_COLORS.primary },
  TERM_LIFE: { label: 'Berjangka', color: CHART_COLORS.secondary },
  UNIT_LINK: { label: 'Unit Link', color: CHART_COLORS.info },
  ENDOWMENT: { label: 'Endowment', color: CHART_COLORS.warning },
  HEALTH: { label: 'Kesehatan', color: CHART_COLORS.success },
} satisfies ChartConfig

interface ProductChartProps {
  byProductCode: Record<string, number> | undefined
}

export function ProductChart({ byProductCode }: ProductChartProps) {
  const chartData = useMemo(() => {
    if (!byProductCode) return []
    return Object.entries(byProductCode)
      .map(([code, count]) => {
        const config = productChartConfig[code as keyof typeof productChartConfig]
        const color = config && 'color' in config ? config.color : CHART_COLORS.primary
        return {
          product: productLabels[code] || code,
          value: count,
          fill: color,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [byProductCode])

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Distribusi Produk</CardTitle>
        <CardDescription>Jumlah polis per jenis produk</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ChartContainer config={productChartConfig} className="h-full w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
            >
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                dataKey="product"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={85}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" radius={5}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
