import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthStatsProps {
  stats: {
    active: number
    inactive: number
    smokers: number
    withChronicIllness: number
  } | null
}

export function HealthStats({ stats }: HealthStatsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Statistik Kesehatan Tertanggung</CardTitle>
        <CardDescription>Informasi kesehatan tertanggung</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Tertanggung Aktif</p>
                <p className="text-sm text-muted-foreground">Status aktif</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">{stats?.active || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Tidak Aktif</p>
                <p className="text-sm text-muted-foreground">Status tidak aktif</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Perokok</p>
                <p className="text-sm text-muted-foreground">Risiko lebih tinggi</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">{stats?.smokers || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Penyakit Kronis</p>
                <p className="text-sm text-muted-foreground">Memerlukan perhatian khusus</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-red-600">{stats?.withChronicIllness || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
