import { Breadcrumbs } from '@/components/Breadcrumbs';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { Agent } from '@/types';
import { ArrowLeft, Building2, Calendar, Edit, Mail, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  INACTIVE: { label: 'Tidak Aktif', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  SUSPENDED: { label: 'Ditangguhkan', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
};

export function AgentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${id}`);
        const data = await response.json();
        if (data.success) {
          setAgent(data.data);
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
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Agen berhasil dihapus');
        navigate('/agents');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal menghapus agen');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Agen', href: '/agents' },
        { label: agent.fullName },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/agents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{agent.fullName}</h2>
            <p className="text-muted-foreground">{agent.agentCode}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/agents/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Lengkap</span>
              <span className="font-medium">{agent.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kode Agen</span>
              <span className="font-medium">{agent.agentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig[agent.status]?.color}`}>
                {statusConfig[agent.status]?.label}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{agent.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telepon</span>
              <span>{agent.phone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Branch Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Cabang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kode Cabang</span>
              <span className="font-medium">{agent.branchCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Cabang</span>
              <span>{agent.branchName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Bergabung</span>
              <span>{agent.joinDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibuat</span>
              <span>{new Date(agent.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diperbarui</span>
              <span>{new Date(agent.updatedAt).toLocaleDateString('id-ID')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Agen</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus agen {agent.fullName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
