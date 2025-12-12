import { useMemo } from 'react'
import { PieChart, Pie } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const genderChartConfig = {
  male: { label: 'Laki-laki', color: 'hsl(221, 83%, 53%)' },
  female: { label: 'Perempuan', color: 'hsl(330, 81%, 60%)' },
} satisfies ChartConfig

interface GenderChartProps {
  byGender: { male: number; female: number } | undefined
}

export function GenderChart({ byGender }: GenderChartProps) {
  const chartData = useMemo(() => {
    if (!byGender) return []
    return [
      { name: 'male', value: byGender.male, fill: genderChartConfig.male.color },
      { name: 'female', value: byGender.female, fill: genderChartConfig.female.color },
    ]
  }, [byGender])

  const total = byGender ? byGender.male + byGender.female : 0

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Distribusi Gender</CardTitle>
        <CardDescription>Jumlah tertanggung berdasarkan gender</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={genderChartConfig} className="mx-auto h-[200px]">
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
        <div className="mt-4 flex justify-center gap-6">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {genderChartConfig[item.name as keyof typeof genderChartConfig]?.label}
              </span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total Tertanggung</p>
        </div>
      </CardContent>
    </Card>
  )
}
