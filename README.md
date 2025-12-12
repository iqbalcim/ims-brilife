# BRI Life Insurance Management System (IMS)

Sistem Manajemen Asuransi untuk PT BRI Life - Frontend Application

## 🚀 Tech Stack

| Technology      | Version | Purpose          |
| --------------- | ------- | ---------------- |
| React           | 19.2    | UI Framework     |
| TypeScript      | 5.9     | Type Safety      |
| Vite            | 7.2     | Build Tool       |
| Tailwind CSS    | 4.1     | Styling          |
| shadcn/ui       | Latest  | UI Components    |
| Zustand         | 5.0     | State Management |
| React Router    | 7.10    | Routing          |
| react-hook-form | 7.68    | Form Handling    |
| Zod             | 3.x     | Validation       |
| MSW             | 2.12    | API Mocking      |
| Vitest          | 4.0     | Testing          |

## ✅ Features

### Mandatory Requirements

- [x] **Authentication** - Login/Logout with protected routes
- [x] **CRUD 2 Entities** - Policy & Insured Person
- [x] **File Upload Mock** - Document simulation
- [x] **Search/Sort/Filter/Pagination** - All list views

### Bonus Features

- [x] Lazy loading (React.lazy)
- [x] Skeleton loading states
- [x] Dark/Light mode toggle
- [x] Dashboard with charts
- [x] Responsive design

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 🔑 Test Credentials

| Role  | Username | Password |
| ----- | -------- | -------- |
| Admin | admin    | admin123 |
| Agent | agent    | agent123 |

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── layout/          # AuthGuard, Header, Sidebar, MainLayout
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── utils.ts         # Utility functions
│   └── validators.ts    # Zod schemas
├── mocks/
│   ├── data/            # Mock data
│   └── handlers/        # MSW request handlers
├── pages/
│   ├── auth/            # Login page
│   ├── dashboard/       # Dashboard page
│   ├── insured-person/  # List, Detail, Form
│   └── policy/          # List, Detail, Form
├── routes/              # React Router config
├── store/               # Zustand stores
├── types/               # TypeScript interfaces
└── __tests__/           # Unit tests
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests once
npm run test -- --run
```

**Test Coverage:** 26 tests passed

- Auth Store (7 tests)
- Theme Store (6 tests)
- Validators (13 tests)

## 🎯 API Endpoints (MSW Mocked)

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Policies

- `GET /api/policies` - List with pagination
- `GET /api/policies/stats` - Dashboard stats
- `GET /api/policies/:id` - Single policy
- `POST /api/policies` - Create
- `PUT /api/policies/:id` - Update
- `DELETE /api/policies/:id` - Delete

### Insured Persons

- `GET /api/insured-persons` - List with pagination
- `GET /api/insured-persons/stats` - Dashboard stats
- `GET /api/insured-persons/:id` - Single person
- `POST /api/insured-persons` - Create
- `PUT /api/insured-persons/:id` - Update
- `DELETE /api/insured-persons/:id` - Delete

## 📄 License

Private - PT BRI Life Technical Test
