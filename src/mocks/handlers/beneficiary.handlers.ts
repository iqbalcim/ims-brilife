import { http, HttpResponse, delay } from 'msw';
import { mockBeneficiaries, mockPolicies } from '@/mocks/data';
import type { Beneficiary } from '@/types';

interface BeneficiaryWithMeta extends Beneficiary {
  policyId: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
let beneficiariesData: BeneficiaryWithMeta[] = [...mockBeneficiaries];

export const beneficiaryHandlers = [
  // Get stats - MUST be before :id route
  http.get('/api/beneficiaries/stats', async () => {
    await delay(200);

    const byRelationship = {
      suami: beneficiariesData.filter((b) => b.relationship === 'SUAMI').length,
      istri: beneficiariesData.filter((b) => b.relationship === 'ISTRI').length,
      anak: beneficiariesData.filter((b) => b.relationship === 'ANAK').length,
      orangTua: beneficiariesData.filter((b) => b.relationship === 'ORANG_TUA')
        .length,
      saudara: beneficiariesData.filter((b) => b.relationship === 'SAUDARA')
        .length,
      lainnya: beneficiariesData.filter((b) => b.relationship === 'LAINNYA')
        .length,
    };

    return HttpResponse.json({
      success: true,
      data: {
        total: beneficiariesData.length,
        byRelationship,
      },
    });
  }),

  // Get all beneficiaries with search, filter, sort, pagination
  http.get('/api/beneficiaries', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const relationship = url.searchParams.get('relationship') || '';
    const policyId = url.searchParams.get('policyId') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    let filteredBeneficiaries = [...beneficiariesData];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBeneficiaries = filteredBeneficiaries.filter(
        (b) =>
          b.name.toLowerCase().includes(searchLower) ||
          b.identityNumber.includes(search)
      );
    }

    // Filter by relationship
    if (relationship && relationship !== 'all') {
      filteredBeneficiaries = filteredBeneficiaries.filter(
        (b) => b.relationship === relationship
      );
    }

    // Filter by policy
    if (policyId) {
      filteredBeneficiaries = filteredBeneficiaries.filter(
        (b) => b.policyId === policyId
      );
    }

    // Sort
    filteredBeneficiaries.sort((a, b) => {
      const aValue = a[sortBy as keyof BeneficiaryWithMeta];
      const bValue = b[sortBy as keyof BeneficiaryWithMeta];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    // Pagination
    const total = filteredBeneficiaries.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedBeneficiaries = filteredBeneficiaries.slice(
      start,
      start + limit
    );

    // Add policy info
    const beneficiariesWithPolicy = paginatedBeneficiaries.map((b) => ({
      ...b,
      policy: mockPolicies.find((p) => p.id === b.policyId),
    }));

    return HttpResponse.json({
      success: true,
      data: beneficiariesWithPolicy,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),

  // Get single beneficiary
  http.get('/api/beneficiaries/:id', async ({ params }) => {
    await delay(200);

    const beneficiary = beneficiariesData.find((b) => b.id === params.id);

    if (!beneficiary) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Penerima manfaat tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const beneficiaryWithPolicy = {
      ...beneficiary,
      policy: mockPolicies.find((p) => p.id === beneficiary.policyId),
    };

    return HttpResponse.json({
      success: true,
      data: beneficiaryWithPolicy,
    });
  }),

  // Create beneficiary
  http.post('/api/beneficiaries', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as Partial<BeneficiaryWithMeta>;

    const newBeneficiary: BeneficiaryWithMeta = {
      id: `BEN-${Date.now()}`,
      policyId: body.policyId || '',
      name: body.name || '',
      relationship: body.relationship || 'LAINNYA',
      beneficiaryType: body.beneficiaryType || 'PRIMARY',
      identityNumber: body.identityNumber || '',
      phoneNumber: body.phoneNumber || '',
      percentage: body.percentage || 0,
      dateOfBirth: body.dateOfBirth || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    beneficiariesData.push(newBeneficiary);

    return HttpResponse.json({
      success: true,
      data: newBeneficiary,
    });
  }),

  // Update beneficiary
  http.put('/api/beneficiaries/:id', async ({ params, request }) => {
    await delay(300);

    const beneficiaryIndex = beneficiariesData.findIndex(
      (b) => b.id === params.id
    );

    if (beneficiaryIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Penerima manfaat tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<BeneficiaryWithMeta>;
    const existingBeneficiary = beneficiariesData[beneficiaryIndex];

    const updatedBeneficiary: BeneficiaryWithMeta = {
      ...existingBeneficiary,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    beneficiariesData[beneficiaryIndex] = updatedBeneficiary;

    return HttpResponse.json({
      success: true,
      data: updatedBeneficiary,
    });
  }),

  // Delete beneficiary
  http.delete('/api/beneficiaries/:id', async ({ params }) => {
    await delay(300);

    const beneficiaryIndex = beneficiariesData.findIndex(
      (b) => b.id === params.id
    );

    if (beneficiaryIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Penerima manfaat tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    beneficiariesData.splice(beneficiaryIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Penerima manfaat berhasil dihapus',
    });
  }),
];
