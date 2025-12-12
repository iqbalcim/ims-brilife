import { FileX, FolderOpen, Search, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateType = 'noData' | 'noResults' | 'noFilter' | 'error'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const defaultConfig: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  noData: {
    icon: <Inbox className="h-12 w-12 text-muted-foreground/50" />,
    title: 'Belum Ada Data',
    description: 'Data yang Anda cari belum tersedia. Mulai dengan menambahkan data baru.',
  },
  noResults: {
    icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
    title: 'Tidak Ditemukan',
    description: 'Tidak ada hasil yang cocok dengan pencarian Anda. Coba kata kunci lain.',
  },
  noFilter: {
    icon: <FolderOpen className="h-12 w-12 text-muted-foreground/50" />,
    title: 'Tidak Ada Hasil',
    description: 'Tidak ada data yang sesuai dengan filter yang dipilih.',
  },
  error: {
    icon: <FileX className="h-12 w-12 text-destructive/50" />,
    title: 'Terjadi Kesalahan',
    description: 'Gagal memuat data. Silakan coba lagi nanti.',
  },
}

export function EmptyState({
  type = 'noData',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = defaultConfig[type]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        {config.icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title || config.title}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {description || config.description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
