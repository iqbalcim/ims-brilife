import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  MapPin,
  Briefcase,
  Heart,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileUpload } from '@/components/FileUpload'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import type { InsuredPerson, PersonStatus, Gender, MaritalStatus, IncomeRange } from '@/types'

const personFileTypes = [
  { value: 'KTP', label: 'KTP' },
  { value: 'KK', label: 'Kartu Keluarga' },
  { value: 'PAS_FOTO', label: 'Pas Foto 3x4' },
  { value: 'NPWP', label: 'NPWP' },
  { value: 'SKD', label: 'Surat Keterangan Dokter' },
];

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

const maritalLabels: Record<MaritalStatus, string> = {
  SINGLE: 'Belum Menikah',
  MARRIED: 'Menikah',
  DIVORCED: 'Cerai',
  WIDOWED: 'Janda/Duda',
}

const incomeLabels: Record<IncomeRange, string> = {
  BELOW_5M: '< Rp 5 Juta',
  '5M_10M': 'Rp 5-10 Juta',
  '10M_25M': 'Rp 10-25 Juta',
  '25M_50M': 'Rp 25-50 Juta',
  ABOVE_50M: '> Rp 50 Juta',
}

export function InsuredPersonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState<InsuredPerson | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await fetch(`/api/insured-persons/${id}`)
        const data = await response.json()

        if (data.success) {
          setPerson(data.data)
        } else {
          toast.error('Tertanggung tidak ditemukan')
          navigate('/insured-persons')
        }
      } catch (error) {
        toast.error('Gagal memuat data tertanggung')
      } finally {
        setLoading(false)
      }
    }

    fetchPerson()
  }, [id, navigate])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/insured-persons/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Tertanggung berhasil dihapus')
        navigate('/insured-persons')
      } else {
        toast.error(data.message || 'Gagal menghapus tertanggung')
      }
    } catch (error) {
      toast.error('Gagal menghapus tertanggung')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!person) return null

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Tertanggung', href: '/insured-persons' },
        { label: person.fullName },
      ]} />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/insured-persons">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{person.fullName}</h2>
              <Badge className={statusColors[person.status]}>
                {statusLabels[person.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{person.identityNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/insured-persons/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">{genderLabels[person.gender]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Perkawinan</p>
                <p className="font-medium">{maritalLabels[person.maritalStatus]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                <p className="font-medium">
                  {formatDate(person.dateOfBirth)} ({calculateAge(person.dateOfBirth)} tahun)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempat Lahir</p>
                <p className="font-medium">{person.placeOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{person.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No. Telepon</p>
                <p className="font-medium">{person.phoneNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Alamat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Alamat Lengkap</p>
              <p className="font-medium">{person.address.street}</p>
              {person.address.rt && person.address.rw && (
                <p className="text-sm text-muted-foreground">
                  RT {person.address.rt} / RW {person.address.rw}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Kelurahan</p>
                <p className="font-medium">{person.address.kelurahan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kecamatan</p>
                <p className="font-medium">{person.address.kecamatan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kota</p>
                <p className="font-medium">{person.address.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Provinsi</p>
                <p className="font-medium">{person.address.province}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kode Pos</p>
                <p className="font-medium">{person.address.postalCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Pekerjaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Pekerjaan</p>
                <p className="font-medium">{person.occupation}</p>
              </div>
              {person.companyName && (
                <div>
                  <p className="text-sm text-muted-foreground">Nama Perusahaan</p>
                  <p className="font-medium">{person.companyName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Pendapatan Bulanan</p>
                <p className="font-medium">{incomeLabels[person.monthlyIncome]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Informasi Kesehatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Tinggi Badan</p>
                <p className="font-medium">{person.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Berat Badan</p>
                <p className="font-medium">{person.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BMI</p>
                <p className="font-medium">
                  {(person.weight / Math.pow(person.height / 100, 2)).toFixed(1)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Status Merokok</p>
                <Badge variant={person.isSmoker ? 'destructive' : 'secondary'}>
                  {person.isSmoker ? 'Perokok' : 'Tidak Merokok'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Penyakit Kronis</p>
                <Badge variant={person.hasChronicIllness ? 'destructive' : 'secondary'}>
                  {person.hasChronicIllness ? 'Ada' : 'Tidak Ada'}
                </Badge>
              </div>
            </div>
            {person.hasChronicIllness && person.chronicIllnessDetails && (
              <div>
                <p className="text-sm text-muted-foreground">Detail Penyakit Kronis</p>
                <p className="font-medium">{person.chronicIllnessDetails}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Upload */}
        <div className="lg:col-span-2">
          <FileUpload
            entityType="insured-person"
            entityId={id || ''}
            fileTypes={personFileTypes}
            title="Dokumen Tertanggung"
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Tertanggung</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{person.fullName}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
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
