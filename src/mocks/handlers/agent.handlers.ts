import { http, HttpResponse, delay } from 'msw';
import { mockAgents } from '@/mocks/data';
import type { Agent } from '@/types';

// In-memory store for agents
let agents = [...mockAgents];

export const agentHandlers = [
  // Get agents list with pagination and filtering
  http.get('/api/agents', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const level = url.searchParams.get('level') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    let filtered = [...agents];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.fullName.toLowerCase().includes(searchLower) ||
          a.agentCode.toLowerCase().includes(searchLower) ||
          a.email.toLowerCase().includes(searchLower) ||
          a.licenseNumber.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }

    // Level filter
    if (level) {
      filtered = filtered.filter((a) => a.level === level);
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Agent];
      const bValue = b[sortBy as keyof Agent];
      if (aValue === undefined || bValue === undefined) return 0;
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
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),

  // Get agent statistics
  http.get('/api/agents/stats', async () => {
    await delay(200);

    const activeAgents = agents.filter((a) => a.status === 'ACTIVE').length;
    const inactiveAgents = agents.filter((a) => a.status === 'INACTIVE').length;
    const suspendedAgents = agents.filter((a) => a.status === 'SUSPENDED').length;
    const totalPremium = agents.reduce((sum, a) => sum + a.totalPremiumYTD, 0);
    const totalPolicies = agents.reduce((sum, a) => sum + a.totalPolicies, 0);

    return HttpResponse.json({
      success: true,
      data: {
        totalAgents: agents.length,
        activeAgents,
        inactiveAgents,
        suspendedAgents,
        totalPremiumYTD: totalPremium,
        totalPolicies,
        byLevel: {
          AGENCY_MANAGER: agents.filter((a) => a.level === 'AGENCY_MANAGER').length,
          SENIOR: agents.filter((a) => a.level === 'SENIOR').length,
          ASSOCIATE: agents.filter((a) => a.level === 'ASSOCIATE').length,
        },
      },
    });
  }),

  // Get single agent by ID
  http.get('/api/agents/:id', async ({ params }) => {
    await delay(200);

    const agent = agents.find((a) => a.id === params.id);
    if (!agent) {
      return HttpResponse.json(
        { success: false, message: 'Agen tidak ditemukan' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: agent,
    });
  }),

  // Create new agent
  http.post('/api/agents', async ({ request }) => {
    await delay(400);

    const body = await request.json() as Partial<Agent>;

    // Generate new ID
    const maxId = agents.reduce((max, a) => {
      const num = parseInt(a.id.replace('AGT-', ''));
      return num > max ? num : max;
    }, 0);

    const newAgent: Agent = {
      id: `AGT-${String(maxId + 1).padStart(3, '0')}`,
      agentCode: body.agentCode || `BRL-XXX-${String(maxId + 1).padStart(3, '0')}`,
      fullName: body.fullName || '',
      email: body.email || '',
      phone: body.phone || '',
      licenseNumber: body.licenseNumber || '',
      licenseExpiry: body.licenseExpiry || '',
      level: body.level || 'ASSOCIATE',
      branchCode: body.branchCode || '',
      branchName: body.branchName || '',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      status: body.status || 'ACTIVE',
      totalPremiumYTD: 0,
      totalPolicies: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    agents.push(newAgent);

    return HttpResponse.json({
      success: true,
      message: 'Agen berhasil ditambahkan',
      data: newAgent,
    });
  }),

  // Update agent
  http.put('/api/agents/:id', async ({ params, request }) => {
    await delay(400);

    const agentIndex = agents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'Agen tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json() as Partial<Agent>;
    const updatedAgent: Agent = {
      ...agents[agentIndex],
      ...body,
      id: params.id as string,
      updatedAt: new Date().toISOString(),
    };

    agents[agentIndex] = updatedAgent;

    return HttpResponse.json({
      success: true,
      message: 'Agen berhasil diperbarui',
      data: updatedAgent,
    });
  }),

  // Delete agent
  http.delete('/api/agents/:id', async ({ params }) => {
    await delay(300);

    const agentIndex = agents.findIndex((a) => a.id === params.id);
    if (agentIndex === -1) {
      return HttpResponse.json(
        { success: false, message: 'Agen tidak ditemukan' },
        { status: 404 }
      );
    }

    agents.splice(agentIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Agen berhasil dihapus',
    });
  }),


];
