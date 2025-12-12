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
import { useDebounce, useInsuredPerson } from '@/hooks'
import { formatDate, calculateAge } from '@/lib/utils'
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
  ACTIVE: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
  BLACKLISTED: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
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
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<InsuredPerson | null>(null)
  const [persons, setPersons] = useState<InsuredPerson[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Use custom hooks
  const debouncedSearch = useDebounce(localSearch, 300)
  const { 
    deleteInsuredPerson, 
    isDeleting, 
    isLoading,
    selectPerson,
    selectedPerson,
  } = useInsuredPerson()

  const status = searchParams.get('status') || ''
  const gender = searchParams.get('gender') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const page = parseInt(searchParams.get('page') || '1')

  const [loading, setLoading] = useState(true)

  const fetchPersons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
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
      // Error handled by hook
    } finally {
      setLoading(false)
    }
  }

  // Sync debounced search with URL
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
    fetchPersons()
  }, [debouncedSearch, status, gender, sortBy, sortOrder, page])

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
    if (!personToDelete) return
    
    // Use hook's delete function
    const success = await deleteInsuredPerson(personToDelete.id)
    if (success) {
      fetchPersons()
    }
    setDeleteDialogOpen(false)
    setPersonToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Daftar Tertanggung
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola data tertanggung asuransi
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:shadow-lg">
          <Link to="/insured-persons/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tertanggung
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200">
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIK, email, atau telepon..."
                value={localSearch}
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
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead
                  className="cursor-pointer font-semibold text-gray-900"
                  onClick={() => handleSort('fullName')}
                >
                  Nama {sortBy === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="font-semibold text-gray-900">NIK</TableHead>
                <TableHead className="font-semibold text-gray-900">Jenis Kelamin</TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-gray-900"
                  onClick={() => handleSort('dateOfBirth')}
                >
                  Usia {sortBy === 'dateOfBirth' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="font-semibold text-gray-900">Kota</TableHead>
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
                  <TableRow key={person.id} className="hover:bg-blue-50/40 transition-colors">
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
                      <Badge variant="outline" className={`${statusColors[person.status]} pointer-events-none rounded-md px-2.5 py-0.5 font-medium`}>
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
                            setPersonToDelete(person)
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
              Apakah Anda yakin ingin menghapus <strong>{personToDelete?.fullName}</strong>?
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
