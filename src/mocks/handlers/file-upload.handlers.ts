import { http, HttpResponse, delay } from 'msw';

interface UploadedFile {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  base64Preview?: string;
  uploadedAt: string;
}

// In-memory storage for uploaded files
let uploadedFiles: UploadedFile[] = [
  {
    id: 'file-001',
    entityType: 'insured-person',
    entityId: 'person-1',
    fileName: 'ktp_ahmad_widodo.jpg',
    fileType: 'KTP',
    fileSize: 256000,
    mimeType: 'image/jpeg',
    uploadedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'file-002',
    entityType: 'insured-person',
    entityId: 'person-1',
    fileName: 'pas_foto_ahmad_3x4.jpg',
    fileType: 'PAS_FOTO',
    fileSize: 85000,
    mimeType: 'image/jpeg',
    uploadedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'file-003',
    entityType: 'premium-payment',
    entityId: 'PAY-001',
    fileName: 'bukti_transfer_bca_jan2025.jpg',
    fileType: 'BUKTI_TRANSFER',
    fileSize: 128000,
    mimeType: 'image/jpeg',
    uploadedAt: '2025-01-08T10:00:00Z',
  },
];

export const fileUploadHandlers = [
  // Get files for an entity
  http.get('/api/files/:entityType/:entityId', async ({ params }) => {
    await delay(200);

    const files = uploadedFiles.filter(
      (f) =>
        f.entityType === params.entityType && f.entityId === params.entityId
    );

    return HttpResponse.json({
      success: true,
      data: files,
    });
  }),

  // Upload file
  http.post('/api/files/upload', async ({ request }) => {
    await delay(500);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string;
    const entityId = formData.get('entityId') as string;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return HttpResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Format file tidak didukung. Gunakan JPEG, PNG, atau PDF.',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return HttpResponse.json(
        { success: false, message: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      entityType,
      entityId,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };

    uploadedFiles.push(newFile);

    return HttpResponse.json({
      success: true,
      data: newFile,
      message: 'File berhasil diupload',
    });
  }),

  // Delete file
  http.delete('/api/files/:fileId', async ({ params }) => {
    await delay(300);

    const fileIndex = uploadedFiles.findIndex((f) => f.id === params.fileId);

    if (fileIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 404 }
      );
    }

    uploadedFiles.splice(fileIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'File berhasil dihapus',
    });
  }),
];
