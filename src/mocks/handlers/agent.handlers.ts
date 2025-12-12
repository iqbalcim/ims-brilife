import { http, HttpResponse, delay } from 'msw';
import { mockAgents } from '@/mocks/data';

export const agentHandlers = [
  // Get agents dropdown (for Policy form)
  http.get('/api/agents', async () => {
    await delay(200);

    const activeAgents = mockAgents.filter((a) => a.status === 'ACTIVE');

    return HttpResponse.json({
      success: true,
      data: activeAgents,
    });
  }),
];
