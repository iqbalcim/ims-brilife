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
  Users,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import type { InsuredPerson, PersonStatus, Gender, PaginatedResponse } from '@/types'

const statusColors: Record<PersonStatus, string> = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
  BLACKLISTED: 'bg-red-500',
}

const statusLabels: Record<PersonStatus, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Tidak Aktif',
  BLACKLISTED: 'Blacklist',
}

const genderLabels: Record<Gender, string> = {
  MALE: 'Laki-laki',
  FEMALE: 'Perempuan',
}

export function InsuredPersonListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [persons, setPersons] = useState<InsuredPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<InsuredPerson | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const gender = searchParams.get('gender') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const page = parseInt(searchParams.get('page') || '1')

  const fetchPersons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status,
        gender,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`/api/insured-persons?${params}`)
      const data: PaginatedResponse<InsuredPerson> = await response.json()

      if (data.success) {
        setPersons(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      toast.error('Gagal memuat data tertanggung')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersons()
  }, [search, status, gender, sortBy, sortOrder, page])

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

  const handleGenderFilter = (value: string) => {
    setSearchParams((prev) => {
      if (value === 'all') {
        prev.delete('gender')
      } else {
        prev.set('gender', value)
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
    if (!selectedPerson) return

    setDeleting(selectedPerson.id)
    try {
      const response = await fetch(`/api/insured-persons/${selectedPerson.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Tertanggung berhasil dihapus')
        fetchPersons()
      } else {
        toast.error(data.message || 'Gagal menghapus tertanggung')
      }
    } catch (error) {
      toast.error('Gagal menghapus tertanggung')
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setSelectedPerson(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Tertanggung</h2>
          <p className="text-muted-foreground">
            Kelola data tertanggung asuransi
          </p>
        </div>
        <Button asChild>
          <Link to="/insured-persons/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tertanggung
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
                placeholder="Cari nama, NIK, email, atau telepon..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gender || 'all'} onValueChange={handleGenderFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gender</SelectItem>
                {Object.entries(genderLabels).map(([key, label]) => (
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
                  onClick={() => handleSort('fullName')}
                >
                  Nama {sortBy === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('dateOfBirth')}
                >
                  Usia {sortBy === 'dateOfBirth' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Kota</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : persons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Tidak ada data tertanggung</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                persons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{person.fullName}</p>
                        <p className="text-xs text-muted-foreground">{person.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{person.identityNumber}</TableCell>
                    <TableCell>{genderLabels[person.gender]}</TableCell>
                    <TableCell>{calculateAge(person.dateOfBirth)} tahun</TableCell>
                    <TableCell>{person.address.city}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[person.status]}>
                        {statusLabels[person.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(person.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/insured-persons/${person.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/insured-persons/${person.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPerson(person)
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
        {!loading && persons.length > 0 && (
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
            <DialogTitle>Hapus Tertanggung</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedPerson?.fullName}</strong>?
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
