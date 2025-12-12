import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Policy } from '@/types';

const beneficiaryFormSchema = z.object({
  policyId: z.string().min(1, 'Polis wajib dipilih'),
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  relationship: z.string().min(1, 'Hubungan wajib dipilih'),
  identityNumber: z.string().min(10, 'Nomor identitas minimal 10 karakter'),
  phoneNumber: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  percentage: z.number().min(1, 'Persentase minimal 1%').max(100, 'Persentase maksimal 100%'),
  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi'),
});

type BeneficiaryFormValues = z.infer<typeof beneficiaryFormSchema>;

export function BeneficiaryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [policies, setPolicies] = useState<{ id: string; policyNumber: string; productName: string }[]>([]);

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: {
      policyId: '',
      name: '',
      relationship: 'SPOUSE',
      identityNumber: '',
      phoneNumber: '',
      percentage: 100,
      dateOfBirth: '',
    },
  });

  // Fetch policies for dropdown
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch('/api/policies?limit=100');
        const data = await response.json();
        if (data.success) {
          setPolicies(data.data.map((p: Policy) => ({
            id: p.id,
            policyNumber: p.policyNumber,
            productName: p.productName,
          })));
        }
      } catch {
        toast.error('Gagal memuat data polis');
      }
    };
    fetchPolicies();
  }, []);

  // Fetch beneficiary data if editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchBeneficiary = async () => {
      try {
        const response = await fetch(`/api/beneficiaries/${id}`);
        const data = await response.json();

        if (data.success) {
          const beneficiary = data.data;
          form.reset({
            policyId: beneficiary.policyId,
            name: beneficiary.name,
            relationship: beneficiary.relationship,
            identityNumber: beneficiary.identityNumber,
            phoneNumber: beneficiary.phoneNumber,
            percentage: beneficiary.percentage,
            dateOfBirth: beneficiary.dateOfBirth,
          });
        } else {
          toast.error('Penerima manfaat tidak ditemukan');
          navigate('/beneficiaries');
        }
      } catch {
        toast.error('Gagal memuat data penerima manfaat');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiary();
  }, [id, isEditing, form, navigate]);

  const onSubmit = async (data: BeneficiaryFormValues) => {
    setSubmitting(true);
    try {
      const url = isEditing ? `/api/beneficiaries/${id}` : '/api/beneficiaries';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEditing ? 'Penerima manfaat berhasil diperbarui' : 'Penerima manfaat berhasil dibuat');
        navigate(`/beneficiaries/${result.data.id}`);
      } else {
        toast.error(result.message || 'Gagal menyimpan penerima manfaat');
      }
    } catch {
      toast.error('Gagal menyimpan penerima manfaat');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/beneficiaries">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Penerima Manfaat' : 'Tambah Penerima Manfaat'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Perbarui informasi penerima manfaat' : 'Buat penerima manfaat baru'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Penerima Manfaat</CardTitle>
              <CardDescription>Detail data penerima manfaat polis</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="policyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Polis</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih polis" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policies.map((policy) => (
                          <SelectItem key={policy.id} value={policy.id}>
                            {policy.policyNumber} - {policy.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap penerima" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationship"
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
                        <SelectItem value="SPOUSE">Pasangan</SelectItem>
                        <SelectItem value="CHILD">Anak</SelectItem>
                        <SelectItem value="PARENT">Orang Tua</SelectItem>
                        <SelectItem value="SIBLING">Saudara</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
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
                      <Input placeholder="Nomor KTP/Passport" {...field} />
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
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persentase Manfaat (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        placeholder="100"
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

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/beneficiaries">Batal</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
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
  );
}
