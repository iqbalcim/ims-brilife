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
import { DatePicker } from '@/components/DatePicker';
import { Combobox } from '@/components/Combobox';

const paymentSchema = z.object({
  policyId: z.string().min(1, 'Polis wajib dipilih'),
  amount: z.number().min(10000, 'Jumlah minimal Rp 10.000'),
  dueDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  paymentDate: z.string().optional(),
  method: z.string().optional(),
  status: z.string().min(1, 'Status wajib dipilih'),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PremiumPaymentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [policies, setPolicies] = useState<{ id: string; policyNumber: string; productName: string }[]>([]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      policyId: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      paymentDate: '',
      method: '',
      status: 'PENDING',
      notes: '',
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

  // Fetch payment data if editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/premium-payments/${id}`);
        const data = await response.json();

        if (data.success) {
          const payment = data.data;
          form.reset({
            policyId: payment.policyId,
            amount: payment.amount,
            dueDate: payment.dueDate,
            paymentDate: payment.paymentDate || '',
            method: payment.method || '',
            status: payment.status,
            notes: payment.notes || '',
          });
        } else {
          toast.error('Pembayaran tidak ditemukan');
          navigate('/premium-payments');
        }
      } catch {
        toast.error('Gagal memuat data pembayaran');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, isEditing, form, navigate]);

  const onSubmit = async (data: PaymentFormValues) => {
    setSubmitting(true);
    try {
      const url = isEditing ? `/api/premium-payments/${id}` : '/api/premium-payments';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEditing ? 'Pembayaran berhasil diperbarui' : 'Pembayaran berhasil dibuat');
        navigate(`/premium-payments/${result.data.id}`);
      } else {
        toast.error(result.message || 'Gagal menyimpan pembayaran');
      }
    } catch {
      toast.error('Gagal menyimpan pembayaran');
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
          <Link to="/premium-payments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Pembayaran' : 'Tambah Pembayaran Baru'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Perbarui informasi pembayaran' : 'Buat pembayaran premi baru'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
              <CardDescription>Detail pembayaran premi</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="policyId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Polis</FormLabel>
                    <Combobox
                      options={policies.map((policy) => ({
                        value: policy.id,
                        label: policy.policyNumber,
                        description: policy.productName,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Pilih polis"
                      searchPlaceholder="Cari nomor polis..."
                      emptyText="Polis tidak ditemukan"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah (Rp)</FormLabel>
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
                name="dueDate"
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Menunggu</SelectItem>
                        <SelectItem value="PAID">Lunas</SelectItem>
                        <SelectItem value="OVERDUE">Jatuh Tempo Terlewat</SelectItem>
                        <SelectItem value="FAILED">Gagal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Bayar</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      placeholder="Pilih tanggal bayar"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                        <SelectItem value="VIRTUAL_ACCOUNT">Virtual Account</SelectItem>
                        <SelectItem value="AUTO_DEBIT">Auto Debit</SelectItem>
                        <SelectItem value="CREDIT_CARD">Kartu Kredit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Catatan opsional" {...field} />
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
              <Link to="/premium-payments">Batal</Link>
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
