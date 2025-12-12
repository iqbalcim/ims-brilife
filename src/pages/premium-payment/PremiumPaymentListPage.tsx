import { DataTable, type Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks';
import type { Policy, PremiumPayment } from '@/types';
import {
  AlertTriangle,
  Check,
  Clock,
  CreditCard,
  Edit,
  Eye,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface PaymentWithPolicy extends PremiumPayment {
  policy?: Policy;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PAID: { label: 'Lunas', className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800', icon: <Check className="h-3 w-3" /> },
  PENDING: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800', icon: <Clock className="h-3 w-3" /> },
  OVERDUE: { label: 'Jatuh Tempo Terlewat', className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800', icon: <AlertTriangle className="h-3 w-3" /> },
  FAILED: { label: 'Gagal', className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800', icon: <XCircle className="h-3 w-3" /> },
  REFUNDED: { label: 'Dikembalikan', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800', icon: <RotateCcw className="h-3 w-3" /> },
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
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, failed: 0, totalAmount: 0 });

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

  const columns: Column<PaymentWithPolicy>[] = useMemo(() => [
    {
      key: 'paymentNumber',
      header: 'No. Pembayaran',
      sortable: true,
      className: 'font-medium',
    },
    {
      key: 'policy',
      header: 'Polis',
      className: 'text-sm',
      cell: (payment) => (
        <span>{payment.policy?.policyNumber || payment.policyId}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      sortable: true,
      className: 'font-medium',
      cell: (payment) => formatCurrency(payment.amount),
    },
    {
      key: 'dueDate',
      header: 'Jatuh Tempo',
      className: 'text-sm',
    },
    {
      key: 'method',
      header: 'Metode',
      className: 'text-sm',
      cell: (payment) => (
        <span>{payment.method ? methodLabels[payment.method] : '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment) => (
        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium ${statusConfig[payment.status]?.className}`}>
          {statusConfig[payment.status]?.icon}
          {statusConfig[payment.status]?.label}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      cell: (payment) => (
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
      ),
    },
  ], []);

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
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : <div className="text-2xl font-bold text-foreground">{stats.total}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-green-200 bg-green-50/50 dark:ring-green-800 dark:bg-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Lunas</CardTitle>
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" /></div> : <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.paid}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-yellow-200 bg-yellow-50/50 dark:ring-yellow-800 dark:bg-yellow-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-yellow-600 dark:text-yellow-400" /></div> : <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-blue-200 bg-blue-50/50 dark:ring-blue-800 dark:bg-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Terbayar</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" /></div> : <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(stats.totalAmount)}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-border">
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

      {/* DataTable */}
      <DataTable
        data={payments}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data pembayaran"
        pagination={{
          page,
          limit: 10,
          total: stats.total,
          totalPages,
          onPageChange: setPage,
        }}
        sorting={{
          sortBy,
          sortOrder,
          onSort: toggleSort,
        }}
      />

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
