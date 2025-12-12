import { DatePicker } from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useInsuredPerson } from '@/hooks'
import { insuredPersonSchema, type InsuredPersonFormValues } from '@/lib/validators'
import type { Document } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, FileText, Loader2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export function InsuredPersonFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    fetchInsuredPersonById,
    createInsuredPerson,
    updateInsuredPerson,
    isCreating,
    isUpdating,
  } = useInsuredPerson()

  const [loading, setLoading] = useState(isEditing)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadType, setUploadType] = useState<string>('KTP')

  const form = useForm<InsuredPersonFormValues>({
    resolver: zodResolver(insuredPersonSchema),
    defaultValues: {
      fullName: '',
      gender: 'MALE',
      dateOfBirth: '',
      placeOfBirth: '',
      maritalStatus: 'SINGLE',
      identityType: 'KTP',
      identityNumber: '',
      email: '',
      phoneNumber: '+62',
      address: {
        street: '',
        rt: '',
        rw: '',
        kelurahan: '',
        kecamatan: '',
        city: '',
        province: '',
        postalCode: '',
      },
      occupation: '',
      companyName: '',
      monthlyIncome: '5M_10M',
      height: 170,
      weight: 65,
      isSmoker: false,
      hasChronicIllness: false,
      chronicIllnessDetails: '',
    },
  })

  const hasChronicIllness = form.watch('hasChronicIllness')

  // Fetch person data if editing
  useEffect(() => {
    if (!isEditing || !id) return

    const loadPerson = async () => {
      const person = await fetchInsuredPersonById(id)
      if (person) {
        form.reset({
          fullName: person.fullName,
          gender: person.gender,
          dateOfBirth: person.dateOfBirth,
          placeOfBirth: person.placeOfBirth,
          maritalStatus: person.maritalStatus,
          identityType: person.identityType,
          identityNumber: person.identityNumber,
          identityExpiry: person.identityExpiry || undefined,
          email: person.email,
          phoneNumber: person.phoneNumber,
          address: person.address,
          occupation: person.occupation,
          companyName: person.companyName || '',
          monthlyIncome: person.monthlyIncome,
          height: person.height,
          weight: person.weight,
          isSmoker: person.isSmoker,
          hasChronicIllness: person.hasChronicIllness,
          chronicIllnessDetails: person.chronicIllnessDetails || '',
        })
        setDocuments(person.documents || [])
      } else {
        navigate('/insured-persons')
      }
      setLoading(false)
    }

    loadPerson()
  }, [id, isEditing, form, navigate, fetchInsuredPersonById])

  const onSubmit = async (data: InsuredPersonFormValues) => {
    let result
    if (isEditing && id) {
      result = await updateInsuredPerson(id, data as any)
    } else {
      result = await createInsuredPerson(data as any)
    }

    if (result) {
      navigate(`/insured-persons/${result.id}`)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    // Validate file
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error('Hanya file JPG, PNG, atau PDF yang diizinkan')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)

      const response = await fetch(`/api/insured-persons/${id}/documents`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Dokumen berhasil diunggah')
        setDocuments([...documents, result.data])
      } else {
        toast.error(result.message || 'Gagal mengunggah dokumen')
      }
    } catch (error) {
      toast.error('Gagal mengunggah dokumen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/insured-persons/${id}/documents/${docId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Dokumen berhasil dihapus')
        setDocuments(documents.filter((d) => d.id !== docId))
      } else {
        toast.error(result.message || 'Gagal menghapus dokumen')
      }
    } catch (error) {
      toast.error('Gagal menghapus dokumen')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/insured-persons">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Tertanggung' : 'Tambah Tertanggung Baru'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Perbarui informasi tertanggung' : 'Daftarkan tertanggung baru'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Sesuai KTP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Laki-laki</SelectItem>
                        <SelectItem value="FEMALE">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Perkawinan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SINGLE">Belum Menikah</SelectItem>
                        <SelectItem value="MARRIED">Menikah</SelectItem>
                        <SelectItem value="DIVORCED">Cerai</SelectItem>
                        <SelectItem value="WIDOWED">Janda/Duda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempat Lahir</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      placeholder="Pilih tanggal lahir"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Identitas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KTP">KTP</SelectItem>
                        <SelectItem value="SIM">SIM</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Identitas</FormLabel>
                    <FormControl>
                      <Input placeholder="16 digit NIK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="+62812xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Alamat</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-3">
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Jl. xxx No. xx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.kelurahan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelurahan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.kecamatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kota</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provinsi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Employment */}
          <Card>
            <CardHeader>
              <CardTitle>Pekerjaan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pekerjaan</FormLabel>
                    <FormControl>
                      <Input placeholder="Karyawan Swasta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Perusahaan (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="PT xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pendapatan Bulanan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BELOW_5M">{"< Rp 5 Juta"}</SelectItem>
                        <SelectItem value="5M_10M">Rp 5-10 Juta</SelectItem>
                        <SelectItem value="10M_25M">Rp 10-25 Juta</SelectItem>
                        <SelectItem value="25M_50M">Rp 25-50 Juta</SelectItem>
                        <SelectItem value="ABOVE_50M">{"> Rp 50 Juta"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Health */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kesehatan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tinggi Badan (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berat Badan (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <FormField
                  control={form.control}
                  name="isSmoker"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mt-0!">Perokok</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasChronicIllness"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mt-0!">Memiliki Penyakit Kronis</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {hasChronicIllness && (
                <FormField
                  control={form.control}
                  name="chronicIllnessDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detail Penyakit Kronis</FormLabel>
                      <FormControl>
                        <Input placeholder="Jelaskan penyakit kronis yang dimiliki" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Documents (only when editing) */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Dokumen</CardTitle>
                <CardDescription>Upload KTP, Foto, atau dokumen lainnya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KTP">KTP</SelectItem>
                      <SelectItem value="KK">Kartu Keluarga</SelectItem>
                      <SelectItem value="PAS_FOTO">Pas Foto 3x4</SelectItem>
                      <SelectItem value="NPWP">NPWP</SelectItem>
                      <SelectItem value="SKD">Surat Keterangan Dokter</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Dokumen
                      </>
                    )}
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/insured-persons">Batal</Link>
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                isEditing ? 'Perbarui' : 'Simpan'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
