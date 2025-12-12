import { http, HttpResponse, delay } from 'msw';
import { mockPremiumPayments, mockPolicies } from '@/mocks/data';
import type { PremiumPayment } from '@/types';

// In-memory storage
let paymentsData: PremiumPayment[] = [...mockPremiumPayments];

export const premiumPaymentHandlers = [
  // Get stats - MUST be before :id route
  http.get('/api/premium-payments/stats', async () => {
    await delay(200);

    const totalAmount = paymentsData
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const stats = {
      total: paymentsData.length,
      paid: paymentsData.filter((p) => p.status === 'PAID').length,
      pending: paymentsData.filter((p) => p.status === 'PENDING').length,
      failed: paymentsData.filter((p) => p.status === 'FAILED').length,
      totalAmount,
      byMethod: {
        bankTransfer: paymentsData.filter((p) => p.method === 'BANK_TRANSFER')
          .length,
        virtualAccount: paymentsData.filter(
          (p) => p.method === 'VIRTUAL_ACCOUNT'
        ).length,
        autoDebit: paymentsData.filter((p) => p.method === 'AUTO_DEBIT').length,
        creditCard: paymentsData.filter((p) => p.method === 'CREDIT_CARD')
          .length,
      },
    };

    return HttpResponse.json({
      success: true,
      data: stats,
    });
  }),

  // Get all payments with search, filter, sort, pagination
  http.get('/api/premium-payments', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const policyId = url.searchParams.get('policyId') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    let filteredPayments = [...paymentsData];

    // Search by payment number
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPayments = filteredPayments.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(searchLower) ||
          p.receiptNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (status) {
      filteredPayments = filteredPayments.filter((p) => p.status === status);
    }

    // Filter by policy
    if (policyId) {
      filteredPayments = filteredPayments.filter(
        (p) => p.policyId === policyId
      );
    }

    // Sort
    filteredPayments.sort((a, b) => {
      const aValue = a[sortBy as keyof PremiumPayment];
      const bValue = b[sortBy as keyof PremiumPayment];

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
    const total = filteredPayments.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedPayments = filteredPayments.slice(start, start + limit);

    // Add policy data
    const paymentsWithRelations = paginatedPayments.map((p) => ({
      ...p,
      policy: mockPolicies.find((pol) => pol.id === p.policyId),
    }));

    return HttpResponse.json({
      success: true,
      data: paymentsWithRelations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),

  // Get single payment
  http.get('/api/premium-payments/:id', async ({ params }) => {
    await delay(200);

    const payment = paymentsData.find((p) => p.id === params.id);

    if (!payment) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Pembayaran tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const paymentWithRelations = {
      ...payment,
      policy: mockPolicies.find((pol) => pol.id === payment.policyId),
    };

    return HttpResponse.json({
      success: true,
      data: paymentWithRelations,
    });
  }),

  // Create payment
  http.post('/api/premium-payments', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as Partial<PremiumPayment>;

    const newPayment: PremiumPayment = {
      id: `PAY-${Date.now()}`,
      paymentNumber: `INV-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-5)}`,
      policyId: body.policyId || '',
      amount: body.amount || 0,
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      paymentDate: body.paymentDate,
      method: body.method,
      status: body.status || 'PENDING',
      receiptNumber: body.paymentDate
        ? `RCP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`
        : undefined,
      notes: body.notes,
      periodNumber: body.periodNumber || 1,
      gracePeriodEnd: body.gracePeriodEnd,
      bankName: body.bankName,
      referenceNumber: body.referenceNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    paymentsData.push(newPayment);

    return HttpResponse.json({
      success: true,
      data: newPayment,
    });
  }),

  // Update payment
  http.put('/api/premium-payments/:id', async ({ params, request }) => {
    await delay(300);

    const paymentIndex = paymentsData.findIndex((p) => p.id === params.id);

    if (paymentIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Pembayaran tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<PremiumPayment>;
    const existingPayment = paymentsData[paymentIndex];

    const updatedPayment: PremiumPayment = {
      ...existingPayment,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Auto generate receipt if paid
    if (body.status === 'PAID' && !updatedPayment.receiptNumber) {
      updatedPayment.receiptNumber = `RCP-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-5)}`;
      updatedPayment.paymentDate = new Date().toISOString().split('T')[0];
    }

    paymentsData[paymentIndex] = updatedPayment;

    return HttpResponse.json({
      success: true,
      data: updatedPayment,
    });
  }),

  // Delete payment
  http.delete('/api/premium-payments/:id', async ({ params }) => {
    await delay(300);

    const paymentIndex = paymentsData.findIndex((p) => p.id === params.id);

    if (paymentIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Pembayaran tidak ditemukan',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    paymentsData.splice(paymentIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Pembayaran berhasil dihapus',
    });
  }),
];
