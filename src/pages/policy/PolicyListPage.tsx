import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  FileText,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce, usePolicy } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const { deletePolicy, isDeleting } = usePolicy()

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
    setSearchParams((prev) => {
      if (debouncedSearch) {
        prev.set('search', debouncedSearch)
      } else {
        prev.delete('search')
      }
      prev.set('page', '1')
      return prev
    })
  }, [debouncedSearch, setSearchParams])

  useEffect(() => {
    fetchPolicies()
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
      const currentSortBy = prev.get('sortBy')
      const currentSortOrder = prev.get('sortOrder')

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

      {/* Table */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead
                    className="cursor-pointer font-semibold text-gray-900"
                    onClick={() => handleSort('policyNumber')}
                  >
                    No. Polis {sortBy === 'policyNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Produk</TableHead>
                  <TableHead className="font-semibold text-gray-900">Tertanggung</TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold text-gray-900"
                    onClick={() => handleSort('premiumAmount')}
                  >
                    Premi {sortBy === 'premiumAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold text-gray-900"
                    onClick={() => handleSort('createdAt')}
                  >
                    Dibuat {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Aksi</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Tidak ada data polis</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-blue-50/40 transition-colors">
                    <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{policy.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {productLabels[policy.productCode]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{policy.insuredPerson?.fullName || '-'}</TableCell>
                    <TableCell>{formatCurrency(policy.premiumAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[policy.status]} pointer-events-none rounded-md px-2.5 py-0.5 font-medium`}>
                        {statusLabels[policy.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(policy.createdAt)}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {!loading && policies.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

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
