import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Users,
  Download,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Policy, PolicyStatus, ProductCode } from '@/types'

// Status colors sesuai lifecycle polis asuransi jiwa
const statusColors: Record<PolicyStatus, string> = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-blue-400',
  PENDING_MEDICAL: 'bg-orange-500',
  PENDING_DOCUMENT: 'bg-yellow-500',
  PENDING_APPROVAL: 'bg-amber-500',
  APPROVED: 'bg-cyan-500',
  ACTIVE: 'bg-green-500',
  LAPSED: 'bg-red-500',
  REINSTATEMENT: 'bg-orange-400',
  PAID_UP: 'bg-purple-500',
  SURRENDER: 'bg-gray-600',
  CLAIM_PROCESS: 'bg-indigo-500',
  TERMINATED: 'bg-gray-700',
}

// Labels dalam Bahasa Indonesia
const statusLabels: Record<PolicyStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'SPAJ Dikirim',
  PENDING_MEDICAL: 'Menunggu Medical',
  PENDING_DOCUMENT: 'Menunggu Dokumen',
  PENDING_APPROVAL: 'Dalam Underwriting',
  APPROVED: 'Disetujui',
  ACTIVE: 'Aktif',
  LAPSED: 'Lapse',
  REINSTATEMENT: 'Reaktivasi',
  PAID_UP: 'Paid Up',
  SURRENDER: 'Dicairkan',
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

const frequencyLabels: Record<string, string> = {
  MONTHLY: 'Bulanan',
  QUARTERLY: 'Triwulan',
  SEMI_ANNUAL: 'Semester',
  ANNUAL: 'Tahunan',
}

// Labels hubungan penerima manfaat
const relationshipLabels: Record<string, string> = {
  SUAMI: 'Suami',
  ISTRI: 'Istri',
  ANAK: 'Anak',
  ORANG_TUA: 'Orang Tua',
  SAUDARA: 'Saudara',
  LAINNYA: 'Lainnya',
}

export function PolicyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(`/api/policies/${id}`)
        const data = await response.json()

        if (data.success) {
          setPolicy(data.data)
        } else {
          toast.error('Polis tidak ditemukan')
          navigate('/policies')
        }
      } catch (error) {
        toast.error('Gagal memuat data polis')
      } finally {
        setLoading(false)
      }
    }

    fetchPolicy()
  }, [id, navigate])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Polis berhasil dihapus')
        navigate('/policies')
      } else {
        toast.error(data.message || 'Gagal menghapus polis')
      }
    } catch (error) {
      toast.error('Gagal menghapus polis')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
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
      month: 'long',
      year: 'numeric',
    })
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

  if (!policy) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/policies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{policy.policyNumber}</h2>
              <Badge className={statusColors[policy.status]}>
                {statusLabels[policy.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{policy.productName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/policies/${id}/edit`}>
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
        {/* Policy Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Polis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Jenis Produk</p>
                <p className="font-medium">{productLabels[policy.productCode]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frekuensi Premi</p>
                <p className="font-medium">{frequencyLabels[policy.premiumFrequency]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premi</p>
                <p className="font-medium">{formatCurrency(policy.premiumAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uang Pertanggungan</p>
                <p className="font-medium">{formatCurrency(policy.sumAssured)}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Aplikasi</p>
                <p className="font-medium">{formatDate(policy.applicationDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Efektif</p>
                <p className="font-medium">{formatDate(policy.effectiveDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
                <p className="font-medium">{formatDate(policy.maturityDate)}</p>
              </div>
            </div>
            {policy.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="font-medium">{policy.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Insured Person */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tertanggung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {policy.insuredPerson ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-medium">{policy.insuredPerson.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                    <p className="font-medium">
                      {policy.insuredPerson.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Lahir</p>
                    <p className="font-medium">{formatDate(policy.insuredPerson.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">No. Identitas</p>
                    <p className="font-medium">{policy.insuredPerson.identityNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{policy.insuredPerson.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">No. Telepon</p>
                    <p className="font-medium">{policy.insuredPerson.phoneNumber}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/insured-persons/${policy.insuredPersonId}`}>
                    Lihat Detail Tertanggung
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Data tertanggung tidak tersedia</p>
            )}
          </CardContent>
        </Card>

        {/* Beneficiaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Penerima Manfaat ({policy.beneficiaries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Hubungan</TableHead>
                  <TableHead className="text-right">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policy.beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell className="font-medium">{beneficiary.name}</TableCell>
                    <TableCell>{relationshipLabels[beneficiary.relationship] || beneficiary.relationship}</TableCell>
                    <TableCell className="text-right">{beneficiary.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumen ({policy.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {policy.documents.length > 0 ? (
              <div className="space-y-2">
                {policy.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Belum ada dokumen</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Polis</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus polis <strong>{policy.policyNumber}</strong>?
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
