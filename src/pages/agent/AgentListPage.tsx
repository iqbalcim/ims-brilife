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
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';
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
import type { Agent } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Aktif', className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' },
  INACTIVE: { label: 'Tidak Aktif', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200' },
  SUSPENDED: { label: 'Ditangguhkan', className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' },
};

export function AgentListPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
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
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Agen</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalAgents}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.activeAgents}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200 bg-gray-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tidak Aktif</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.inactiveAgents}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-inset ring-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Ditangguhkan</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.suspendedAgents}</div>
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

      {/* Table */}
      <Card className="border-0 shadow-sm ring-1 ring-inset ring-gray-200 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Tidak ada data agen
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      <button onClick={() => toggleSort('agentCode')} className="flex items-center gap-1">
                        Kode Agen <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      <button onClick={() => toggleSort('fullName')} className="flex items-center gap-1">
                        Nama Lengkap <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Telepon</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cabang</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{agent.agentCode}</td>
                      <td className="px-4 py-3">{agent.fullName}</td>
                      <td className="px-4 py-3 text-sm">{agent.email}</td>
                      <td className="px-4 py-3 text-sm">{agent.phone}</td>
                      <td className="px-4 py-3 text-sm">{agent.branchName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusConfig[agent.status]?.className}`}>
                          {statusConfig[agent.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>


      {/* Pagination */}
      {(!loading && agents.length > 0) && (
        <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, stats.totalAgents)} dari {stats.totalAgents} agen
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Halaman {page} dari {totalPages}
              </span>
              <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
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
