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
  Heart,
  Users,
  Baby,
  UserRound,
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
import type { Beneficiary, Policy } from '@/types';

interface BeneficiaryWithPolicy extends Beneficiary {
  policyId: string;
  policy?: Policy;
  createdAt: string;
  updatedAt: string;
}

const relationshipLabels: Record<string, string> = {
  SPOUSE: 'Pasangan',
  CHILD: 'Anak',
  PARENT: 'Orang Tua',
  SIBLING: 'Saudara',
  OTHER: 'Lainnya',
};

export function BeneficiaryListPage() {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryWithPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, byRelationship: { spouse: 0, child: 0, parent: 0, sibling: 0, other: 0 } });

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        relationship,
        sortBy,
        sortOrder,
      });

      const [beneficiariesRes, statsRes] = await Promise.all([
        fetch(`/api/beneficiaries?${params}`),
        fetch('/api/beneficiaries/stats'),
      ]);

      const beneficiariesData = await beneficiariesRes.json();
      const statsData = await statsRes.json();

      if (beneficiariesData.success) {
        setBeneficiaries(beneficiariesData.data);
        setTotalPages(beneficiariesData.pagination.totalPages);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch {
      toast.error('Gagal memuat data penerima manfaat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [page, search, relationship, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/beneficiaries/${deleteId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Penerima manfaat berhasil dihapus');
        fetchBeneficiaries();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal menghapus penerima manfaat');
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
          <h2 className="text-2xl font-bold">Penerima Manfaat</h2>
          <p className="text-muted-foreground">Kelola data penerima manfaat polis</p>
        </div>
        <Button asChild>
          <Link to="/beneficiaries/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Penerima
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pasangan</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.byRelationship.spouse}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anak</CardTitle>
            <Baby className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.byRelationship.child}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orang Tua</CardTitle>
            <UserRound className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.byRelationship.parent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lainnya</CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.byRelationship.sibling + stats.byRelationship.other}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau nomor identitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hubungan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Hubungan</SelectItem>
                <SelectItem value="SPOUSE">Pasangan</SelectItem>
                <SelectItem value="CHILD">Anak</SelectItem>
                <SelectItem value="PARENT">Orang Tua</SelectItem>
                <SelectItem value="SIBLING">Saudara</SelectItem>
                <SelectItem value="OTHER">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Tidak ada data penerima manfaat
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      <button onClick={() => toggleSort('name')} className="flex items-center gap-1">
                        Nama <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Hubungan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">No. Identitas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Telepon</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      <button onClick={() => toggleSort('percentage')} className="flex items-center gap-1">
                        Persentase <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Polis</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((beneficiary) => (
                    <tr key={beneficiary.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{beneficiary.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {relationshipLabels[beneficiary.relationship]}
                      </td>
                      <td className="px-4 py-3 text-sm">{beneficiary.identityNumber}</td>
                      <td className="px-4 py-3 text-sm">{beneficiary.phoneNumber}</td>
                      <td className="px-4 py-3 font-medium">{beneficiary.percentage}%</td>
                      <td className="px-4 py-3 text-sm">
                        {beneficiary.policy?.policyNumber || beneficiary.policyId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/beneficiaries/${beneficiary.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/beneficiaries/${beneficiary.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(beneficiary.id)}
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
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Penerima Manfaat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus penerima manfaat ini?
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
