import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Administrator',
    email: 'admin@brilife.co.id',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'USR-002',
    username: 'agent',
    password: 'agent123',
    role: 'AGENT',
    name: 'Agen BRI Life',
    email: 'agent@brilife.co.id',
    agentId: 'AGT-001',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];
