import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CreditCard, Calendar, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePremiumPayment } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
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
import { FileUpload } from '@/components/FileUpload';
import type { PremiumPayment, Policy } from '@/types';

interface PaymentWithPolicy extends PremiumPayment {
  policy?: Policy;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  FAILED: { label: 'Gagal', color: 'bg-red-100 text-red-800' },
};

const methodLabels: Record<string, string> = {
  BANK_TRANSFER: 'Transfer Bank',
  VIRTUAL_ACCOUNT: 'Virtual Account',
  AUTO_DEBIT: 'Auto Debit',
  CREDIT_CARD: 'Kartu Kredit',
};

const paymentFileTypes = [
  { value: 'BUKTI_TRANSFER', label: 'Bukti Transfer' },
  { value: 'KWITANSI', label: 'Kwitansi' },
  { value: 'INVOICE', label: 'Invoice/Tagihan' },
  { value: 'SLIP_SETORAN', label: 'Slip Setoran Bank' },
];

export function PremiumPaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentWithPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  // Use custom hook for delete operation
  const { deletePayment, isDeleting } = usePremiumPayment();

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`/api/premium-payments/${id}`);
        const data = await response.json();
        if (data.success) {
          setPayment(data.data);
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
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    const success = await deletePayment(id);
    if (success) {
      navigate('/premium-payments');
    }
    setShowDelete(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/premium-payments">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{payment.paymentNumber}</h2>
            <p className="text-muted-foreground">Detail pembayaran premi</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/premium-payments/${id}/edit`}>
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
        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informasi Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Pembayaran</span>
              <span className="font-medium">{payment.paymentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig[payment.status]?.color}`}>
                {statusConfig[payment.status]?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode</span>
              <span>{payment.method ? methodLabels[payment.method] : '-'}</span>
            </div>
            {payment.receiptNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Kwitansi</span>
                <span>{payment.receiptNumber}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jatuh Tempo</span>
              <span className="font-medium">{payment.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Bayar</span>
              <span>{payment.paymentDate || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibuat</span>
              <span>{new Date(payment.createdAt).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diperbarui</span>
              <span>{new Date(payment.updatedAt).toLocaleDateString('id-ID')}</span>
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
            {payment.policy ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">No. Polis</span>
                  <p className="font-medium">{payment.policy.policyNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Produk</span>
                  <p className="font-medium">{payment.policy.productName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status Polis</span>
                  <p className="font-medium">{payment.policy.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Policy ID: {payment.policyId}</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {payment.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{payment.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* File Upload */}
      <FileUpload
        entityType="premium-payment"
        entityId={id || ''}
        fileTypes={paymentFileTypes}
        title="Dokumen Pembayaran"
      />

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pembayaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pembayaran {payment.paymentNumber}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
