import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, Phone, Calendar, FileText, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

export function BeneficiaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beneficiary, setBeneficiary] = useState<BeneficiaryWithPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchBeneficiary = async () => {
      try {
        const response = await fetch(`/api/beneficiaries/${id}`);
        const data = await response.json();
        if (data.success) {
          setBeneficiary(data.data);
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
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/beneficiaries/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('Penerima manfaat berhasil dihapus');
        navigate('/beneficiaries');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal menghapus penerima manfaat');
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

  if (!beneficiary) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/beneficiaries">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{beneficiary.name}</h2>
            <p className="text-muted-foreground">Detail penerima manfaat</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/beneficiaries/${id}/edit`}>
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
              <span className="font-medium">{beneficiary.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hubungan</span>
              <span className="font-medium">{relationshipLabels[beneficiary.relationship]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Identitas</span>
              <span>{beneficiary.identityNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Lahir</span>
              <span>{beneficiary.dateOfBirth}</span>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Percentage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontak & Persentase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Telepon</span>
              <span>{beneficiary.phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Persentase Manfaat</span>
              <span className="flex items-center gap-1 text-xl font-bold text-primary">
                <Percent className="h-5 w-5" />
                {beneficiary.percentage}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Policy Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Polis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {beneficiary.policy ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">No. Polis</span>
                  <p className="font-medium">{beneficiary.policy.policyNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Produk</span>
                  <p className="font-medium">{beneficiary.policy.productName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <p className="font-medium">{beneficiary.policy.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Policy ID: {beneficiary.policyId}</p>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-sm text-muted-foreground">Dibuat</span>
              <p>{new Date(beneficiary.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Diperbarui</span>
              <p>{new Date(beneficiary.updatedAt).toLocaleDateString('id-ID')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Penerima Manfaat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {beneficiary.name}?
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
