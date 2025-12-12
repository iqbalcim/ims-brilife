import { http, HttpResponse, delay } from 'msw';
import { mockInsuredPersons } from '@/mocks/data';
import type { InsuredPerson } from '@/types';

// In-memory storage
let insuredPersonsData: InsuredPerson[] = [...mockInsuredPersons];

export const insuredPersonHandlers = [
  // Get stats - MUST be before :id route
  http.get('/api/insured-persons/stats', async () => {
    await delay(200);

    const stats = {
      total: insuredPersonsData.length,
      active: insuredPersonsData.filter((p) => p.status === 'ACTIVE').length,
      inactive: insuredPersonsData.filter((p) => p.status === 'INACTIVE')
        .length,
      byGender: {
        male: insuredPersonsData.filter((p) => p.gender === 'MALE').length,
        female: insuredPersonsData.filter((p) => p.gender === 'FEMALE').length,
      },
      smokers: insuredPersonsData.filter((p) => p.isSmoker).length,
      withChronicIllness: insuredPersonsData.filter((p) => p.hasChronicIllness)
        .length,
    };

    return HttpResponse.json({
      success: true,
      data: stats,
    });
  }),

  // Get dropdown data - MUST be before :id route
  http.get('/api/insured-persons/dropdown', async () => {
    await delay(200);

    const dropdownData = insuredPersonsData
      .filter((p) => p.status === 'ACTIVE')
      .map((p) => ({
        id: p.id,
        fullName: p.fullName,
        identityNumber: p.identityNumber,
      }));

    return HttpResponse.json({
      success: true,
      data: dropdownData,
    });
  }),

  // Get all insured persons with search, filter, sort, pagination
  http.get('/api/insured-persons', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const gender = url.searchParams.get('gender') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    let filteredPersons = [...insuredPersonsData];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPersons = filteredPersons.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchLower) ||
          p.identityNumber.includes(search) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.phoneNumber.includes(search)
      );
    }

    // Filter by status
    if (status) {
      filteredPersons = filteredPersons.filter((p) => p.status === status);
    }

    // Filter by gender
    if (gender) {
      filteredPersons = filteredPersons.filter((p) => p.gender === gender);
    }

    // Sort
    filteredPersons.sort((a, b) => {
      const aValue = a[sortBy as keyof InsuredPerson];
      const bValue = b[sortBy as keyof InsuredPerson];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

    // Pagination
    const total = filteredPersons.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedPersons = filteredPersons.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: paginatedPersons,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),

  // Get single insured person
  http.get('/api/insured-persons/:id', async ({ params }) => {
    await delay(200);

    const person = insuredPersonsData.find((p) => p.id === params.id);

    if (!person) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Tertanggung tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: person,
    });
  }),

  // Create insured person
  http.post('/api/insured-persons', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as Partial<InsuredPerson>;

    // Check for duplicate identity number
    const existing = insuredPersonsData.find(
      (p) => p.identityNumber === body.identityNumber
    );

    if (existing) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Nomor identitas sudah terdaftar',
          code: 'DUPLICATE_IDENTITY',
        },
        { status: 400 }
      );
    }

    const newPerson = {
      id: `person-${Date.now()}`,
      fullName: body.fullName || '',
      gender: body.gender || 'MALE',
      dateOfBirth: body.dateOfBirth || '',
      placeOfBirth: body.placeOfBirth || '',
      maritalStatus: body.maritalStatus || 'SINGLE',
      identityType: body.identityType || 'KTP',
      identityNumber: body.identityNumber || '',
      email: body.email || '',
      phoneNumber: body.phoneNumber || '',
      address: body.address || {
        street: '',
        kelurahan: '',
        kecamatan: '',
        city: '',
        province: '',
        postalCode: '',
      },
      occupation: body.occupation || '',
      companyName: body.companyName,
      monthlyIncome: body.monthlyIncome || '5M_10M',
      height: body.height || 170,
      weight: body.weight || 65,
      isSmoker: body.isSmoker || false,
      hasChronicIllness: body.hasChronicIllness || false,
      chronicIllnessDetails: body.chronicIllnessDetails,
      status: 'ACTIVE',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as InsuredPerson;

    insuredPersonsData.push(newPerson);

    return HttpResponse.json({
      success: true,
      data: newPerson,
    });
  }),

  // Update insured person
  http.put('/api/insured-persons/:id', async ({ params, request }) => {
    await delay(300);

    const personIndex = insuredPersonsData.findIndex((p) => p.id === params.id);

    if (personIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Tertanggung tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<InsuredPerson>;
    const existingPerson = insuredPersonsData[personIndex];

    const updatedPerson: InsuredPerson = {
      ...existingPerson,
      ...body,
      updatedAt: new Date().toISOString(),
    } as InsuredPerson;

    insuredPersonsData[personIndex] = updatedPerson;

    return HttpResponse.json({
      success: true,
      data: updatedPerson,
    });
  }),

  // Delete insured person
  http.delete('/api/insured-persons/:id', async ({ params }) => {
    await delay(300);

    const personIndex = insuredPersonsData.findIndex((p) => p.id === params.id);

    if (personIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Tertanggung tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    insuredPersonsData.splice(personIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Tertanggung berhasil dihapus',
    });
  }),

  // Upload document
  http.post(
    '/api/insured-persons/:id/documents',
    async ({ params, request }) => {
      await delay(500);

      const personIndex = insuredPersonsData.findIndex(
        (p) => p.id === params.id
      );

      if (personIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Tertanggung tidak ditemukan',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;

      if (!file) {
        return HttpResponse.json(
          {
            success: false,
            message: 'File tidak ditemukan',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF',
            code: 'INVALID_FILE_TYPE',
          },
          { status: 400 }
        );
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Ukuran file maksimal 5MB',
            code: 'FILE_TOO_LARGE',
          },
          { status: 400 }
        );
      }

      const newDocument = {
        id: `doc-${Date.now()}`,
        type: type,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      insuredPersonsData[personIndex].documents.push(newDocument as any);

      return HttpResponse.json({
        success: true,
        data: newDocument,
      });
    }
  ),

  // Delete document
  http.delete(
    '/api/insured-persons/:personId/documents/:docId',
    async ({ params }) => {
      await delay(300);

      const personIndex = insuredPersonsData.findIndex(
        (p) => p.id === params.personId
      );

      if (personIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Tertanggung tidak ditemukan',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const docIndex = insuredPersonsData[personIndex].documents.findIndex(
        (d) => d.id === params.docId
      );

      if (docIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Dokumen tidak ditemukan',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        );
      }

      insuredPersonsData[personIndex].documents.splice(docIndex, 1);

      return HttpResponse.json({
        success: true,
        message: 'Dokumen berhasil dihapus',
      });
    }
  ),
];
