import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePagination } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface FileUploadProps {
  entityType: 'insured-person' | 'premium-payment';
  entityId: string;
  fileTypes: { value: string; label: string }[];
  title?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function FileUpload({ entityType, entityId, fileTypes, title = 'Dokumen' }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/${entityType}/${entityId}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch {
      toast.error('Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  // Load files on mount
  useState(() => {
    if (entityId) fetchFiles();
  });

  // Use custom pagination hook for file list
  const {
    currentItems: paginatedFiles,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination(files, { initialPageSize: 5 });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedType) {
      toast.error('Pilih jenis dokumen terlebih dahulu');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('fileType', selectedType);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setFiles((prev) => [...prev, data.data]);
        setSelectedType('');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal mengupload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/files/${deleteId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setFiles((prev) => prev.filter((f) => f.id !== deleteId));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal menghapus file');
    } finally {
      setDeleteId(null);
    }
  };

  const getFileTypeLabel = (type: string) => {
    return fileTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Form */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Pilih jenis dokumen" />
            </SelectTrigger>
            <SelectContent>
              {fileTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleUpload}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !selectedType}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Format: JPEG, PNG, PDF. Maksimal 5MB
        </p>

        {/* File List */}
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Memuat...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Belum ada dokumen</div>
        ) : (
          <div className="space-y-2">
            {paginatedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {getFileTypeLabel(file.fileType)} • {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={prevPage} disabled={!hasPrevPage}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasNextPage}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Dokumen</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus dokumen ini?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
