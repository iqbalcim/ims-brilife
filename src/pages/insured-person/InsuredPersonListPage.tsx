import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Users,
  UserCheck,
  User,
} from 'lucide-react'
import { useDebounce, useInsuredPerson } from '@/hooks'
import { formatDate, calculateAge } from '@/lib/utils'
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
import type { InsuredPerson, PersonStatus, Gender, PaginatedResponse } from '@/types'
import { DataTable, type Column } from '@/components/common/DataTable'

const statusColors: Record<PersonStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  INACTIVE: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  BLACKLISTED: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
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

  const debouncedSearch = useDebounce(localSearch, 300)
  const {
    deleteInsuredPerson,
    isDeleting,
    selectPerson,
    stats,
    fetchStats
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
    fetchPersons()
    fetchStats()
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
    if (!personToDelete) return

    // Use hook's delete function
    const success = await deleteInsuredPerson(personToDelete.id)
    if (success) {
      fetchPersons()
    }
    setDeleteDialogOpen(false)
    setPersonToDelete(null)
  }

  const columns: Column<InsuredPerson>[] = useMemo(() => [
    {
      key: 'fullName',
      header: 'Nama',
      sortable: true,
      cell: (person) => (
        <div>
          <p className="font-medium">{person.fullName}</p>
          <p className="text-xs text-muted-foreground">{person.email}</p>
        </div>
      )
    },
    {
      key: 'identityNumber',
      header: 'NIK',
      className: 'font-mono text-sm',
    },
    {
      key: 'gender',
      header: 'Jenis Kelamin',
      cell: (person) => genderLabels[person.gender],
    },
    {
      key: 'dateOfBirth',
      header: 'Usia',
      sortable: true,
      cell: (person) => `${calculateAge(person.dateOfBirth)} tahun`,
    },
    {
      key: 'address',
      header: 'Kota',
      cell: (person) => person.address.city,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (person) => (
        <Badge variant="outline" className={`${statusColors[person.status]} pointer-events-none rounded-md px-2.5 py-0.5 font-medium`}>
          {statusLabels[person.status]}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      sortable: true,
      cell: (person) => formatDate(person.createdAt),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      cell: (person) => (
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
      ),
    },
  ], []);

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tertanggung</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : <div className="text-2xl font-bold text-foreground">{stats.total}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-green-200 bg-green-50/50 dark:ring-green-800 dark:bg-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" /></div> : <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-blue-200 bg-blue-50/50 dark:ring-blue-800 dark:bg-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Laki-laki</CardTitle>
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" /></div> : <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.byGender.male}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-pink-200 bg-pink-50/50 dark:ring-pink-800 dark:bg-pink-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-600 dark:text-pink-400">Perempuan</CardTitle>
            <User className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-pink-600 dark:text-pink-400" /></div> : <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">{stats.byGender.female}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-border">
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

      {/* DataTable */}
      <DataTable
        data={persons}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data tertanggung"
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
