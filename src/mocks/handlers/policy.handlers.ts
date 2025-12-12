import { http, HttpResponse, delay } from 'msw';
import { mockPolicies, mockInsuredPersons, mockAgents } from '@/mocks/data';
import type { Policy } from '@/types';

// In-memory storage for policies (cloned from mock data)
let policiesData: Policy[] = [...mockPolicies];

export const policyHandlers = [
  // Get policy stats - MUST be before :id route
  http.get('/api/policies/stats', async () => {
    await delay(200);

    const stats = {
      total: policiesData.length,
      active: policiesData.filter((p) => p.status === 'ACTIVE').length,
      pending: policiesData.filter((p) =>
        ['PENDING_APPROVAL', 'PENDING_MEDICAL', 'PENDING_DOCUMENT'].includes(
          p.status
        )
      ).length,
      lapsed: policiesData.filter((p) => p.status === 'LAPSED').length,
      terminated: policiesData.filter((p) => p.status === 'TERMINATED').length,
      totalPremium: policiesData
        .filter((p) => p.status === 'ACTIVE')
        .reduce((sum, p) => sum + p.premiumAmount, 0),
      totalSumAssured: policiesData
        .filter((p) => p.status === 'ACTIVE')
        .reduce((sum, p) => sum + p.sumAssured, 0),
      byProductCode: policiesData.reduce((acc, p) => {
        acc[p.productCode] = (acc[p.productCode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return HttpResponse.json({
      success: true,
      data: stats,
    });
  }),

  // Get all policies with search, filter, sort, pagination
  http.get('/api/policies', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const productCode = url.searchParams.get('productCode') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    let filteredPolicies = [...policiesData];

    // Search - need to join insured person data first for name search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPolicies = filteredPolicies.filter((p) => {
        const insuredPerson = mockInsuredPersons.find(
          (ip) => ip.id === p.insuredPersonId
        );
        return (
          p.policyNumber.toLowerCase().includes(searchLower) ||
          p.productName.toLowerCase().includes(searchLower) ||
          insuredPerson?.fullName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by status (skip if empty or 'all')
    if (status && status !== 'all') {
      filteredPolicies = filteredPolicies.filter((p) => p.status === status);
    }

    // Filter by product code
    if (productCode) {
      filteredPolicies = filteredPolicies.filter(
        (p) => p.productCode === productCode
      );
    }

    // Sort
    filteredPolicies.sort((a, b) => {
      const aValue = a[sortBy as keyof Policy];
      const bValue = b[sortBy as keyof Policy];

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
    const total = filteredPolicies.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedPolicies = filteredPolicies.slice(start, start + limit);

    // Add insured person data
    const policiesWithRelations = paginatedPolicies.map((p) => ({
      ...p,
      insuredPerson: mockInsuredPersons.find(
        (ip) => ip.id === p.insuredPersonId
      ),
      agent: mockAgents.find((a) => a.id === p.agentId),
    }));

    return HttpResponse.json({
      success: true,
      data: policiesWithRelations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),

  // Get single policy
  http.get('/api/policies/:id', async ({ params }) => {
    await delay(200);

    const policy = policiesData.find((p) => p.id === params.id);

    if (!policy) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Polis tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const policyWithRelations = {
      ...policy,
      insuredPerson: mockInsuredPersons.find(
        (ip) => ip.id === policy.insuredPersonId
      ),
      agent: mockAgents.find((a) => a.id === policy.agentId),
    };

    return HttpResponse.json({
      success: true,
      data: policyWithRelations,
    });
  }),

  // Create policy
  http.post('/api/policies', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as Partial<Policy>;

    // Generate new policy
    const newPolicy = {
      id: `policy-${Date.now()}`,
      policyNumber: `POL-${Date.now().toString().slice(-8)}`,
      productCode: body.productCode || 'TERM_LIFE',
      productName: body.productName || '',
      insuredPersonId: body.insuredPersonId || '',
      agentId: body.agentId || '',
      premiumAmount: body.premiumAmount || 0,
      premiumFrequency: body.premiumFrequency || 'MONTHLY',
      sumAssured: body.sumAssured || 0,
      applicationDate: body.applicationDate || new Date().toISOString(),
      effectiveDate: body.effectiveDate || new Date().toISOString(),
      maturityDate: body.maturityDate || new Date().toISOString(),
      status: 'DRAFT',
      beneficiaries: body.beneficiaries || [],
      documents: [],
      notes: body.notes,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Policy;

    policiesData.push(newPolicy);

    return HttpResponse.json({
      success: true,
      data: newPolicy,
    });
  }),

  // Update policy
  http.put('/api/policies/:id', async ({ params, request }) => {
    await delay(300);

    const policyIndex = policiesData.findIndex((p) => p.id === params.id);

    if (policyIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Polis tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<Policy>;
    const existingPolicy = policiesData[policyIndex];

    const updatedPolicy: Policy = {
      ...existingPolicy,
      ...body,
      updatedAt: new Date().toISOString(),
    } as Policy;

    policiesData[policyIndex] = updatedPolicy;

    return HttpResponse.json({
      success: true,
      data: updatedPolicy,
    });
  }),

  // Delete policy
  http.delete('/api/policies/:id', async ({ params }) => {
    await delay(300);

    const policyIndex = policiesData.findIndex((p) => p.id === params.id);

    if (policyIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Polis tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    policiesData.splice(policyIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Polis berhasil dihapus',
    });
  }),

  // Upload document
  http.post('/api/policies/:id/documents', async ({ params, request }) => {
    await delay(500);

    const policyIndex = policiesData.findIndex((p) => p.id === params.id);

    if (policyIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Polis tidak ditemukan',
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

    // Mock document
    const newDocument = {
      id: `doc-${Date.now()}`,
      type: type,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    };

    policiesData[policyIndex].documents.push(newDocument as any);

    return HttpResponse.json({
      success: true,
      data: newDocument,
    });
  }),

  // Delete document
  http.delete(
    '/api/policies/:policyId/documents/:docId',
    async ({ params }) => {
      await delay(300);

      const policyIndex = policiesData.findIndex(
        (p) => p.id === params.policyId
      );

      if (policyIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Polis tidak ditemukan',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const docIndex = policiesData[policyIndex].documents.findIndex(
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

      policiesData[policyIndex].documents.splice(docIndex, 1);

      return HttpResponse.json({
        success: true,
        message: 'Dokumen berhasil dihapus',
      });
    }
  ),
];
