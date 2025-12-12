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
import { DatePicker } from '@/components/DatePicker';

const agentSchema = z.object({
  agentCode: z.string().min(3, 'Kode agen minimal 3 karakter'),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  branchCode: z.string().min(2, 'Kode cabang wajib diisi'),
  branchName: z.string().min(2, 'Nama cabang wajib diisi'),
  joinDate: z.string().min(1, 'Tanggal bergabung wajib diisi'),
  status: z.string().min(1, 'Status wajib dipilih'),
});

type AgentFormValues = z.infer<typeof agentSchema>;

export function AgentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      agentCode: '',
      fullName: '',
      email: '',
      phone: '',
      branchCode: '',
      branchName: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (!isEditing) return;

    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${id}`);
        const data = await response.json();

        if (data.success) {
          const agent = data.data;
          form.reset({
            agentCode: agent.agentCode,
            fullName: agent.fullName,
            email: agent.email,
            phone: agent.phone,
            branchCode: agent.branchCode,
            branchName: agent.branchName,
            joinDate: agent.joinDate,
            status: agent.status,
          });
        } else {
          toast.error('Agen tidak ditemukan');
          navigate('/agents');
        }
      } catch {
        toast.error('Gagal memuat data agen');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, isEditing, form, navigate]);

  const onSubmit = async (data: AgentFormValues) => {
    setSubmitting(true);
    try {
      const url = isEditing ? `/api/agents/${id}` : '/api/agents';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEditing ? 'Agen berhasil diperbarui' : 'Agen berhasil dibuat');
        navigate(`/agents/${result.data.id}`);
      } else {
        toast.error(result.message || 'Gagal menyimpan agen');
      }
    } catch {
      toast.error('Gagal menyimpan agen');
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
          <Link to="/agents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Agen' : 'Tambah Agen Baru'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Perbarui informasi agen' : 'Buat agen asuransi baru'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Agen</CardTitle>
              <CardDescription>Detail data agen asuransi</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="agentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Agen</FormLabel>
                    <FormControl>
                      <Input placeholder="AGT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap agen" {...field} />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Cabang</FormLabel>
                    <FormControl>
                      <Input placeholder="JKT-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Cabang</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta Pusat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Bergabung</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                      placeholder="Pilih tanggal bergabung"
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
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                        <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/agents">Batal</Link>
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
