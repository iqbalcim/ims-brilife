import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CreditCard,
  Check,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PremiumPayment, Policy } from '@/types';

interface PaymentWithPolicy extends PremiumPayment {
  policy?: Policy;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PAID: { label: 'Lunas', className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200', icon: <Check className="h-3 w-3" /> },
  PENDING: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
  OVERDUE: { label: 'Jatuh Tempo Terlewat', className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200', icon: <AlertTriangle className="h-3 w-3" /> },
  FAILED: { label: 'Gagal', className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200', icon: <XCircle className="h-3 w-3" /> },
  REFUNDED: { label: 'Dikembalikan', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200', icon: <RotateCcw className="h-3 w-3" /> },
};

const methodLabels: Record<string, string> = {
  BANK_TRANSFER: 'Transfer Bank',
  VIRTUAL_ACCOUNT: 'Virtual Account',
  AUTO_DEBIT: 'Auto Debit',
  CREDIT_CARD: 'Kartu Kredit',
};

export function PremiumPaymentListPage() {
  const [payments, setPayments] = useState<PaymentWithPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, failed: 0, totalAmount: 0 });

  // Debounce search for better performance
  const debouncedSearch = useDebounce(localSearch, 300);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
        status,
        sortBy,
        sortOrder,
      });

      const [paymentsRes, statsRes] = await Promise.all([
        fetch(`/api/premium-payments?${params}`),
        fetch('/api/premium-payments/stats'),
      ]);

      const paymentsData = await paymentsRes.json();
      const statsData = await statsRes.json();

      if (paymentsData.success) {
        setPayments(paymentsData.data);
        setTotalPages(paymentsData.pagination.totalPages);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch {
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, debouncedSearch, status, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/premium-payments/${deleteId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Pembayaran berhasil dihapus');
        fetchPayments();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal menghapus pembayaran');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pembayaran Premi
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola pembayaran premi polis
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:shadow-lg">
          <Link to="/premium-payments/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pembayaran
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Lunas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Terbayar</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-700">{formatCurrency(stats.totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200">
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nomor pembayaran..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PAID">Lunas</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="OVERDUE">Jatuh Tempo Terlewat</SelectItem>
                <SelectItem value="FAILED">Gagal</SelectItem>
                <SelectItem value="REFUNDED">Dikembalikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Tidak ada data pembayaran
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      <button onClick={() => toggleSort('paymentNumber')} className="flex items-center gap-1">
                        No. Pembayaran <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Polis</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      <button onClick={() => toggleSort('amount')} className="flex items-center gap-1">
                        Jumlah <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Jatuh Tempo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Metode</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{payment.paymentNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {payment.policy?.policyNumber || payment.policyId}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-3 text-sm">{payment.dueDate}</td>
                      <td className="px-4 py-3 text-sm">
                        {payment.method ? methodLabels[payment.method] : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium ${statusConfig[payment.status]?.className}`}>
                          {statusConfig[payment.status]?.icon}
                          {statusConfig[payment.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/premium-payments/${payment.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/premium-payments/${payment.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(payment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>


      {/* Pagination */}
      {(!loading && payments.length > 0) && (
        <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, stats.total)} dari {stats.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
        </div>
      )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pembayaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pembayaran ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
