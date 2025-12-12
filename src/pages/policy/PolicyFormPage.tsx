import { Combobox } from '@/components/Combobox'
import { DatePicker } from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { usePolicy } from '@/hooks'
import { policySchema, type PolicyFormValues } from '@/lib/validators'
import type { Agent, Document, ProductCode } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, FileText, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

// Katalog Produk Asuransi - didefinisikan oleh perusahaan
const PRODUCT_CATALOG: Record<ProductCode, { code: string; name: string }[]> = {
  WHOLE_LIFE: [
    { code: 'WL-001', name: 'BRILife Asuransi Jiwa Seumur Hidup' },
    { code: 'WL-002', name: 'BRILife Proteksi Keluarga Plus' },
  ],
  TERM_LIFE: [
    { code: 'TL-010', name: 'BRILife Proteksi Berjangka 10' },
    { code: 'TL-015', name: 'BRILife Proteksi Berjangka 15' },
    { code: 'TL-020', name: 'BRILife Proteksi Berjangka 20' },
  ],
  UNIT_LINK: [
    { code: 'UL-001', name: 'BRILife Investa Link' },
    { code: 'UL-002', name: 'BRILife Investa Link Premium' },
  ],
  ENDOWMENT: [
    { code: 'EN-001', name: 'BRILife Dana Pendidikan' },
    { code: 'EN-002', name: 'BRILife Dana Pensiun' },
  ],
  HEALTH: [
    { code: 'HE-001', name: 'BRILife Kesehatan Prima' },
    { code: 'HE-002', name: 'BRILife Kesehatan Keluarga' },
  ],
}

export function PolicyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    fetchPolicyById,
    createPolicy,
    updatePolicy,
    isCreating,
    isUpdating,
  } = usePolicy()

  const [loading, setLoading] = useState(isEditing)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('SPAJ')
  const [documents, setDocuments] = useState<Document[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [insuredPersons, setInsuredPersons] = useState<{ id: string; fullName: string; identityNumber: string }[]>([])

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      productCode: 'TERM_LIFE',
      productName: '',
      insuredPersonId: '',
      agentId: '',
      premiumAmount: 0,
      premiumFrequency: 'MONTHLY',
      sumAssured: 0,
      applicationDate: new Date().toISOString().split('T')[0],
      effectiveDate: '',
      maturityDate: '',
      status: 'DRAFT',
      beneficiaries: [
        {
          name: '',
          relationship: 'SUAMI',
          identityNumber: '',
          phoneNumber: '',
          percentage: 100,
          dateOfBirth: '',
        },
      ],
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'beneficiaries',
  })

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, insuredRes] = await Promise.all([
          fetch('/api/agents?status=ACTIVE&limit=1000'),
          fetch('/api/insured-persons/dropdown'),
        ])

        const agentsData = await agentsRes.json()
        const insuredData = await insuredRes.json()

        if (agentsData.success) setAgents(agentsData.data)
        if (insuredData.success) setInsuredPersons(insuredData.data)
      } catch (error) {
        toast.error('Gagal memuat data dropdown')
      }
    }

    fetchData()
  }, [])

  // Fetch policy data if editing
  useEffect(() => {
    if (!isEditing) return

    const loadPolicy = async () => {
      const policy = await fetchPolicyById(id!)
      if (policy) {
        form.reset({
          productCode: policy.productCode,
          productName: policy.productName,
          insuredPersonId: policy.insuredPersonId,
          agentId: policy.agentId,
          premiumAmount: policy.premiumAmount,
          premiumFrequency: policy.premiumFrequency,
          sumAssured: policy.sumAssured,
          applicationDate: policy.applicationDate,
          effectiveDate: policy.effectiveDate,
          maturityDate: policy.maturityDate,
          status: policy.status,
          beneficiaries: policy.beneficiaries.map((b: any) => ({
            name: b.name,
            relationship: b.relationship,
            identityNumber: b.identityNumber,
            phoneNumber: b.phoneNumber,
            percentage: b.percentage,
            dateOfBirth: b.dateOfBirth,
          })),
          notes: policy.notes || '',
        })
        setDocuments(policy.documents || [])
      } else {
        navigate('/policies')
      }
      setLoading(false)
    }

    loadPolicy()
  }, [id, isEditing, form, navigate, fetchPolicyById])

  const onSubmit = async (data: PolicyFormValues) => {
    let result
    if (isEditing && id) {
      result = await updatePolicy(id, data as any)
    } else {
      result = await createPolicy(data as any)
    }

    if (result) {
      navigate(`/policies/${result.id}`)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

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

      const response = await fetch(`/api/policies/${id}/documents`, {
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
    } catch {
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
      const response = await fetch(`/api/policies/${id}/documents/${docId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Dokumen berhasil dihapus')
        setDocuments(documents.filter((d) => d.id !== docId))
      } else {
        toast.error(result.message || 'Gagal menghapus dokumen')
      }
    } catch {
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
          <Link to="/policies">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Polis' : 'Tambah Polis Baru'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Perbarui informasi polis' : 'Buat polis asuransi baru'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
              <CardDescription>Detail produk asuransi</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Produk</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Reset productName saat jenis produk berubah
                        form.setValue('productName', '')
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis produk" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WHOLE_LIFE">Jiwa Seumur Hidup</SelectItem>
                        <SelectItem value="TERM_LIFE">Jiwa Berjangka</SelectItem>
                        <SelectItem value="UNIT_LINK">Unit Link</SelectItem>
                        <SelectItem value="ENDOWMENT">Endowment</SelectItem>
                        <SelectItem value="HEALTH">Kesehatan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => {
                  const productCode = form.watch('productCode') as ProductCode
                  const products = PRODUCT_CATALOG[productCode] || []

                  return (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.code} value={product.name}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="insuredPersonId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tertanggung</FormLabel>
                    <Combobox
                      options={insuredPersons.map((person) => ({
                        value: person.id,
                        label: person.fullName,
                        description: person.identityNumber,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih tertanggung"
                      searchPlaceholder="Cari nama atau NIK..."
                      emptyText="Tertanggung tidak ditemukan"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Agen</FormLabel>
                    <Combobox
                      options={agents.map((agent) => ({
                        value: agent.id,
                        label: agent.fullName,
                        description: agent.agentCode,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih agen"
                      searchPlaceholder="Cari nama atau kode agen..."
                      emptyText="Agen tidak ditemukan"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Premium Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Premi</CardTitle>
              <CardDescription>Detail pembayaran premi</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="premiumAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Premi (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500000"
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
                name="premiumFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frekuensi Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih frekuensi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Bulanan</SelectItem>
                        <SelectItem value="QUARTERLY">Triwulan</SelectItem>
                        <SelectItem value="SEMI_ANNUAL">Semester</SelectItem>
                        <SelectItem value="ANNUAL">Tahunan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sumAssured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uang Pertanggungan (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Tanggal Polis</CardTitle>
              <CardDescription>Periode berlaku polis</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="applicationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Aplikasi</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      placeholder="Pilih tanggal aplikasi"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Efektif</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      placeholder="Pilih tanggal efektif"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maturityDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      placeholder="Pilih tanggal jatuh tempo"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Beneficiaries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Penerima Manfaat</CardTitle>
                <CardDescription>Total persentase harus 100%</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  name: '',
                  relationship: 'OTHER',
                  identityNumber: '',
                  phoneNumber: '',
                  percentage: 0,
                  dateOfBirth: '',
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">Penerima Manfaat #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`beneficiaries.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`beneficiaries.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hubungan</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SUAMI">Suami</SelectItem>
                              <SelectItem value="ISTRI">Istri</SelectItem>
                              <SelectItem value="ANAK">Anak</SelectItem>
                              <SelectItem value="ORANG_TUA">Orang Tua</SelectItem>
                              <SelectItem value="SAUDARA">Saudara</SelectItem>
                              <SelectItem value="LAINNYA">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`beneficiaries.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Persentase (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="100"
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
                      name={`beneficiaries.${index}.identityNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Identitas</FormLabel>
                          <FormControl>
                            <Input placeholder="NIK/No. KTP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`beneficiaries.${index}.phoneNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Telepon</FormLabel>
                          <FormControl>
                            <Input placeholder="+628xxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`beneficiaries.${index}.dateOfBirth`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value ? new Date(field.value) : undefined}
                              onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                              placeholder="Pilih tanggal lahir"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Catatan tambahan (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Documents (only when editing) */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Dokumen Polis</CardTitle>
                <CardDescription>Upload dokumen pendukung polis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SPAJ">SPAJ (Surat Pengajuan)</SelectItem>
                      <SelectItem value="POLIS_TERBIT">Polis Terbit</SelectItem>
                      <SelectItem value="ILUSTRASI">Ilustrasi Produk</SelectItem>
                      <SelectItem value="FORM_PERUBAHAN">Formulir Perubahan</SelectItem>
                      <SelectItem value="SURAT_KUASA">Surat Kuasa Debit</SelectItem>
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
              <Link to="/policies">Batal</Link>
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
