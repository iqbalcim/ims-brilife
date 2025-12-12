import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce, usePolicy } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExportButton } from '@/components/ExportButton'
import type { Policy, PolicyStatus, ProductCode, PaginatedResponse } from '@/types'
import { DataTable, type Column } from '@/components/common/DataTable'

const statusColors: Record<PolicyStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
  SUBMITTED: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
  PENDING_MEDICAL: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200',
  PENDING_DOCUMENT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
  PENDING_APPROVAL: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
  APPROVED: 'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200',
  ACTIVE: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
  LAPSED: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
  REINSTATEMENT: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
  PAID_UP: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
  SURRENDER: 'bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200',
  CLAIM_PROCESS: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200',
  TERMINATED: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
}

const statusLabels: Record<PolicyStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Diajukan',
  PENDING_MEDICAL: 'Pending Medical',
  PENDING_DOCUMENT: 'Pending Dokumen',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Disetujui',
  ACTIVE: 'Aktif',
  LAPSED: 'Lapsed',
  REINSTATEMENT: 'Pemulihan',
  PAID_UP: 'Paid-Up',
  SURRENDER: 'Surrender',
  CLAIM_PROCESS: 'Proses Klaim',
  TERMINATED: 'Berakhir',
}

const productLabels: Record<ProductCode, string> = {
  WHOLE_LIFE: 'Jiwa Seumur Hidup',
  TERM_LIFE: 'Jiwa Berjangka',
  UNIT_LINK: 'Unit Link',
  ENDOWMENT: 'Endowment',
  HEALTH: 'Kesehatan',
}

export function PolicyListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null)
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Use custom hooks
  const debouncedSearch = useDebounce(localSearch, 300)
  const { deletePolicy, isDeleting, stats, fetchStats } = usePolicy()

  // Get filter values from URL
  const status = searchParams.get('status') || ''
  const productCode = searchParams.get('productCode') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const page = parseInt(searchParams.get('page') || '1')

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
        status,
        productCode,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/policies?${params}`)
      const data: PaginatedResponse<Policy> = await response.json()

      if (data.success) {
        setPolicies(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      toast.error('Gagal memuat data polis')
    } finally {
      setLoading(false)
    }
  }

  // Effect to sync debounced search with URL
  useEffect(() => {
    const currentSearch = searchParams.get('search') || ''
    if (debouncedSearch !== currentSearch) {
      setSearchParams((prev) => {
        if (debouncedSearch) {
          prev.set('search', debouncedSearch)
        } else {
          prev.delete('search')
        }
        prev.set('page', '1')
        return prev
      })
    }
  }, [debouncedSearch, searchParams, setSearchParams])

  useEffect(() => {
    fetchPolicies()
    fetchStats()
  }, [debouncedSearch, status, productCode, sortBy, sortOrder, page])

  const handleSearch = (value: string) => {
    setLocalSearch(value)
  }

  const handleStatusFilter = (value: string) => {
    setSearchParams((prev) => {
      if (value === 'all') {
        prev.delete('status')
      } else {
        prev.set('status', value)
      }
      prev.set('page', '1')
      return prev
    })
  }

  const handleProductFilter = (value: string) => {
    setSearchParams((prev) => {
      if (value === 'all') {
        prev.delete('productCode')
      } else {
        prev.set('productCode', value)
      }
      prev.set('page', '1')
      return prev
    })
  }

  const handleSort = (field: string) => {
    setSearchParams((prev) => {
      const currentSortBy = prev.get('sortBy') || 'createdAt'
      const currentSortOrder = prev.get('sortOrder') || 'desc'

      if (currentSortBy === field) {
        prev.set('sortOrder', currentSortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        prev.set('sortBy', field)
        prev.set('sortOrder', 'desc')
      }
      return prev
    })
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString())
      return prev
    })
  }

  const handleDelete = async () => {
    if (!policyToDelete) return

    // Use hook's delete function
    const success = await deletePolicy(policyToDelete.id)
    if (success) {
      fetchPolicies()
    }
    setDeleteDialogOpen(false)
    setPolicyToDelete(null)
  }

  const columns: Column<Policy>[] = useMemo(() => [
    {
      key: 'policyNumber',
      header: 'No. Polis',
      sortable: true,
      className: 'font-medium',
    },
    {
      key: 'productName',
      header: 'Produk',
      cell: (policy) => (
        <div>
          <p className="font-medium">{policy.productName}</p>
          <p className="text-xs text-muted-foreground">
            {productLabels[policy.productCode]}
          </p>
        </div>
      ),
    },
    {
      key: 'insuredPerson',
      header: 'Tertanggung',
      cell: (policy) => policy.insuredPerson?.fullName || '-',
    },
    {
      key: 'premiumAmount',
      header: 'Premi',
      sortable: true,
      cell: (policy) => formatCurrency(policy.premiumAmount),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (policy) => (
        <Badge variant="outline" className={`${statusColors[policy.status]} pointer-events-none rounded-md px-2.5 py-0.5 font-medium`}>
          {statusLabels[policy.status]}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      sortable: true,
      cell: (policy) => formatDate(policy.createdAt),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      cell: (policy) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/policies/${policy.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/policies/${policy.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setPolicyToDelete(policy)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Daftar Polis
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola dan pantau semua polis asuransi Anda dengan mudah
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={policies}
            filename="polis"
            columns={[
              { key: 'policyNumber', header: 'No. Polis' },
              { key: 'productName', header: 'Produk' },
              { key: 'insuredPersonId', header: 'ID Tertanggung' },
              { key: 'premiumAmount', header: 'Premi' },
              { key: 'sumAssured', header: 'Uang Pertanggungan' },
              { key: 'status', header: 'Status' },
              { key: 'effectiveDate', header: 'Tanggal Efektif' },
            ]}
          />
          <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:shadow-lg">
            <Link to="/policies/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Polis
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Polis</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : <div className="text-2xl font-bold text-gray-900">{stats.total}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Aktif</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div> : <div className="text-2xl font-bold text-green-700">{stats.active}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-emerald-200 bg-emerald-50/50">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Total Premi</CardTitle>
             <Eye className="h-4 w-4 text-emerald-600" />
           </CardHeader>
           <CardContent>
             {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div> : <div className="text-xl font-bold text-emerald-700">{formatCurrency(stats.totalPremium)}</div>}
           </CardContent>
         </Card>
         <Card className="border-0 shadow-sm ring-1 ring-inset ring-amber-200 bg-amber-50/50">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Total UP</CardTitle>
             <Eye className="h-4 w-4 text-amber-600" />
           </CardHeader>
           <CardContent>
             {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-amber-600" /></div> : <div className="text-xl font-bold text-amber-700">{formatCurrency(stats.totalSumAssured)}</div>}
           </CardContent>
         </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200">
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nomor polis, nama produk, atau tertanggung..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={productCode || 'all'} onValueChange={handleProductFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Produk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Produk</SelectItem>
                {Object.entries(productLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable
        data={policies}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data polis"
        pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
            onPageChange: handlePageChange,
        }}
        sorting={{
            sortBy,
            sortOrder: sortOrder as 'asc' | 'desc',
            onSort: handleSort,
        }}
        />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Polis</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus polis <strong>{policyToDelete?.policyNumber}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
