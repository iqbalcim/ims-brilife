import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  FileText,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
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
import type { Policy, PolicyStatus, ProductCode, PaginatedResponse } from '@/types'

const statusColors: Record<PolicyStatus, string> = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-500',
  PENDING_MEDICAL: 'bg-orange-500',
  PENDING_DOCUMENT: 'bg-yellow-500',
  PENDING_APPROVAL: 'bg-indigo-500',
  APPROVED: 'bg-teal-500',
  ACTIVE: 'bg-green-500',
  LAPSED: 'bg-red-400',
  REINSTATEMENT: 'bg-amber-500',
  PAID_UP: 'bg-purple-500',
  SURRENDER: 'bg-pink-500',
  CLAIM_PROCESS: 'bg-cyan-500',
  TERMINATED: 'bg-gray-700',
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Get filter values from URL
  const search = searchParams.get('search') || ''
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
        search,
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

  useEffect(() => {
    fetchPolicies()
  }, [search, status, productCode, sortBy, sortOrder, page])

  const handleSearch = (value: string) => {
    setSearchParams((prev) => {
      prev.set('search', value)
      prev.set('page', '1')
      return prev
    })
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
    if (!selectedPolicy) return

    setDeleting(selectedPolicy.id)
    try {
      const response = await fetch(`/api/policies/${selectedPolicy.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Polis berhasil dihapus')
        fetchPolicies()
      } else {
        toast.error(data.message || 'Gagal menghapus polis')
      }
    } catch (error) {
      toast.error('Gagal menghapus polis')
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setSelectedPolicy(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Polis</h2>
          <p className="text-muted-foreground">
            Kelola semua polis asuransi
          </p>
        </div>
        <Button asChild>
          <Link to="/policies/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Polis
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nomor polis, nama produk, atau tertanggung..."
                value={search}
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('policyNumber')}
                >
                  No. Polis {sortBy === 'policyNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Tertanggung</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('premiumAmount')}
                >
                  Premi {sortBy === 'premiumAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('createdAt')}
                >
                  Dibuat {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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
                  <TableRow key={policy.id}>
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
                      <Badge className={statusColors[policy.status]}>
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
                            setSelectedPolicy(policy)
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
              Apakah Anda yakin ingin menghapus polis <strong>{selectedPolicy?.policyNumber}</strong>?
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
              disabled={deleting !== null}
            >
              {deleting ? (
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
