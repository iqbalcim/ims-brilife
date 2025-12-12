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
import type { Agent } from '@/types';
import {
  Edit,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Aktif', className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
  INACTIVE: { label: 'Tidak Aktif', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
  SUSPENDED: { label: 'Ditangguhkan', className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800' },
};

export function AgentListPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalAgents: 0, activeAgents: 0, inactiveAgents: 0, suspendedAgents: 0 });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status,
        sortBy,
        sortOrder,
      });

      const [agentsRes, statsRes] = await Promise.all([
        fetch(`/api/agents?${params}`),
        fetch('/api/agents/stats'),
      ]);

      const agentsData = await agentsRes.json();
      const statsData = await statsRes.json();

      if (agentsData.success) {
        setAgents(agentsData.data);
        setTotalPages(agentsData.pagination.totalPages);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch {
      toast.error('Gagal memuat data agen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, search, status, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/agents/${deleteId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Agen berhasil dihapus');
        fetchAgents();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal menghapus agen');
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

  const columns: Column<Agent>[] = useMemo(() => [
    {
      key: 'agentCode',
      header: 'Kode Agen',
      sortable: true,
      className: 'font-medium',
    },
    {
      key: 'fullName',
      header: 'Nama Lengkap',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      className: 'text-sm',
    },
    {
      key: 'phone',
      header: 'Telepon',
      className: 'text-sm',
    },
    {
      key: 'branchName',
      header: 'Cabang',
      className: 'text-sm',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (agent) => (
        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusConfig[agent.status]?.className}`}>
          {statusConfig[agent.status]?.label}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      className: 'text-right',
      cell: (agent) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/agents/${agent.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/agents/${agent.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(agent.id)}
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
            Agen Asuransi
          </h2>
          <p className="text-muted-foreground mt-1">
            Kelola data agen dan performa tim penjualan
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:shadow-lg">
          <Link to="/agents/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Agen
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agen</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : <div className="text-2xl font-bold text-foreground">{stats.totalAgents}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-green-200 bg-green-50/50 dark:ring-green-800 dark:bg-green-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" /></div> : <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.activeAgents}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-muted bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tidak Aktif</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : <div className="text-2xl font-bold text-foreground">{stats.inactiveAgents}</div>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-red-200 bg-red-50/50 dark:ring-red-800 dark:bg-red-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Ditangguhkan</CardTitle>
            <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="flex justify-start"><Loader2 className="h-8 w-8 animate-spin text-red-600 dark:text-red-400" /></div> : <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.suspendedAgents}</div>}
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
                placeholder="Cari nama, kode agen, atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable
        data={agents}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data agen"
        pagination={{
          page,
          limit: 10,
          total: stats.totalAgents,
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
            <DialogTitle>Hapus Agen</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus agen ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
