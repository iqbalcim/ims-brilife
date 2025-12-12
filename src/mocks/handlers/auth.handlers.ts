import { http, HttpResponse, delay } from 'msw';
import { mockUsers } from '@/mocks/data';

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as {
      username: string;
      password: string;
    };
    const { username, password } = body;

    // Validate request body
    if (!username || !password) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Username dan password harus diisi',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find((u) => u.username === username);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Username tidak ditemukan',
          code: 'USER_NOT_FOUND',
        },
        { status: 401 }
      );
    }

    // Validate password
    if (user.password !== password) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Password salah',
          code: 'INVALID_PASSWORD',
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Akun tidak aktif',
          code: 'ACCOUNT_INACTIVE',
        },
        { status: 403 }
      );
    }

    // Generate mock token
    const accessToken = `mock-token-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

    // Return success with token
    const { password: _, ...userWithoutPassword } = user;

    return HttpResponse.json({
      success: true,
      data: {
        accessToken,
        expiresAt,
        user: userWithoutPassword,
      },
    });
  }),

  // Logout
  http.post('/api/auth/logout', async () => {
    await delay(200);

    return HttpResponse.json({
      success: true,
      message: 'Berhasil logout',
    });
  }),

  // Get current user
  http.get('/api/auth/me', async ({ request }) => {
    await delay(200);

    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Token tidak valid',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Mock returning the first active user
    const user = mockUsers.find((u) => u.isActive);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User tidak ditemukan',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return HttpResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  }),
];
