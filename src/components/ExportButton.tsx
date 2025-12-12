import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (row: T) => string | number
}

interface ExportButtonProps<T> {
  data: T[]
  columns: Column<T>[]
  filename: string
  disabled?: boolean
}

export function ExportButton<T extends object>({
  data,
  columns,
  filename,
  disabled = false,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false)

  const exportToCSV = () => {
    setExporting(true)
    try {
      // Create CSV header
      const headers = columns.map((col) => col.header).join(',')

      // Create CSV rows
      const rows = data.map((row) => {
        return columns
          .map((col) => {
            let value: string | number
            if (col.accessor) {
              value = col.accessor(row)
            } else {
              value = row[col.key as keyof T] as string | number
            }
            // Escape commas and quotes
            const stringValue = String(value ?? '')
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`
            }
            return stringValue
          })
          .join(',')
      })

      const csvContent = [headers, ...rows].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Data berhasil diekspor ke CSV')
    } catch {
      toast.error('Gagal mengekspor data')
    } finally {
      setExporting(false)
    }
  }

  const exportToJSON = () => {
    setExporting(true)
    try {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Data berhasil diekspor ke JSON')
    } catch {
      toast.error('Gagal mengekspor data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || exporting || data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToCSV}>
          Export ke CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          Export ke JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
