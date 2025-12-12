# BRI Life Insurance Management System (IMS)

Sistem Manajemen Asuransi untuk PT BRI Life - Frontend Technical Test

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
| Zod             | 3.25    | Validation       |
| MSW             | 2.12    | API Mocking      |
| Vitest          | 4.0     | Unit Testing     |
| Recharts        | 2.15    | Charts           |

## ✅ Features Implemented

### Task Utama (Mandatory)

- [x] **Authentication** - Login/Logout dengan protected routes
- [x] **CRUD 5 Entities** - Policy, Insured Person, Agent, Premium Payment, Beneficiary
- [x] **File Upload Mock** - Simulasi upload KTP, KK, Foto, Bukti Pembayaran
- [x] **Search/Sort/Filter/Pagination** - Tersedia di semua list page

### Nilai Tambahan (Bonus)

- [x] Lazy loading (React.lazy + Suspense)
- [x] Skeleton loading states
- [x] Dark/Light mode toggle
- [x] Dashboard dengan charts (Recharts)
- [x] Responsive design (mobile-first)
- [x] Breadcrumbs navigation
- [x] Empty states
- [x] Reusable DataTable component

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm run test

# Run tests once (CI mode)
npm run test -- --run

# Build for production (dengan TypeScript checking)
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
├── __tests__/           # Unit tests (8 files, 66 tests)
├── components/
│   ├── common/          # DataTable, Breadcrumbs, EmptyState, ThemeToggle
│   ├── layout/          # AuthGuard, Header, Sidebar, MainLayout
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom hooks (useDebounce, usePagination, useLocalStorage, dll)
├── lib/
│   ├── utils.ts         # Utility functions (formatCurrency, formatDate, cn)
│   └── validators.ts    # Zod schemas untuk form validation
├── mocks/
│   ├── data/            # Mock data (7 files)
│   │   ├── agents.ts
│   │   ├── beneficiaries.ts
│   │   ├── insured-persons.ts
│   │   ├── policies.ts
│   │   ├── premium-payments.ts
│   │   └── users.ts
│   └── handlers/        # MSW request handlers (8 files)
│       ├── auth.handlers.ts
│       ├── agent.handlers.ts
│       ├── beneficiary.handlers.ts
│       ├── file-upload.handlers.ts
│       ├── insured-person.handlers.ts
│       ├── policy.handlers.ts
│       └── premium-payment.handlers.ts
├── pages/
│   ├── auth/            # LoginPage
│   ├── dashboard/       # DashboardPage + chart components
│   ├── agent/           # AgentListPage, AgentDetailPage, AgentFormPage
│   ├── insured-person/  # InsuredPersonListPage, DetailPage, FormPage
│   ├── policy/          # PolicyListPage, PolicyDetailPage, PolicyFormPage
│   └── premium-payment/ # PremiumPaymentListPage, DetailPage, FormPage
├── routes/              # React Router configuration dengan lazy loading
├── store/               # Zustand stores (authStore, themeStore)
└── types/               # TypeScript interfaces dan types
```

## 🧪 Unit Testing

```bash
npm run test -- --run
```

**Test Results:** 66 tests passed (8 test files)

| Test File             | Tests | Coverage                       |
| --------------------- | ----- | ------------------------------ |
| authStore.test.ts     | 7     | Auth flow, login/logout, token |
| themeStore.test.ts    | 6     | Theme switching, persistence   |
| validators.test.ts    | 13    | Zod schema validation          |
| useDebounce.test.ts   | 4     | Debounce hook                  |
| usePagination.test.ts | 7     | Pagination logic               |
| utils.test.ts         | 10    | Utility functions              |
| Sidebar.test.tsx      | 8     | Navigation rendering           |
| LoginPage.test.tsx    | 8     | Login form & interaction       |

## 🎯 API Endpoints (MSW Mocked)

### Authentication

- `POST /api/auth/login` - Login dengan validasi
- `POST /api/auth/logout` - Logout dan hapus token

### Policies (Polis)

- `GET /api/policies` - List dengan search, filter, sort, pagination
- `GET /api/policies/stats` - Statistik dashboard
- `GET /api/policies/:id` - Detail polis dengan relasi
- `POST /api/policies` - Buat polis baru
- `PUT /api/policies/:id` - Update polis
- `DELETE /api/policies/:id` - Hapus polis
- `POST /api/policies/:id/documents` - Upload dokumen

### Insured Persons (Tertanggung)

- `GET /api/insured-persons` - List dengan filter
- `GET /api/insured-persons/stats` - Statistik
- `GET /api/insured-persons/dropdown` - Data untuk dropdown
- `GET /api/insured-persons/:id` - Detail
- `POST /api/insured-persons` - Create
- `PUT /api/insured-persons/:id` - Update
- `DELETE /api/insured-persons/:id` - Delete

### Premium Payments (Pembayaran Premi)

- `GET /api/premium-payments` - List pembayaran
- `GET /api/premium-payments/stats` - Statistik
- `GET /api/premium-payments/:id` - Detail
- `POST /api/premium-payments` - Create
- `PUT /api/premium-payments/:id` - Update
- `DELETE /api/premium-payments/:id` - Delete

### Agents (Agen)

- `GET /api/agents` - List agen
- `GET /api/agents/stats` - Statistik
- `GET /api/agents/:id` - Detail
- `POST /api/agents` - Create
- `PUT /api/agents/:id` - Update
- `DELETE /api/agents/:id` - Delete

### File Upload

- `POST /api/upload` - Upload file (simulasi)
- `GET /api/files/:entityType/:entityId` - Get files
- `DELETE /api/files/:id` - Delete file

## 🎨 UI/UX Features

- **Dark/Light Mode** - Toggle dengan persistence ke localStorage
- **Responsive Design** - Mobile-first dengan breakpoints
- **Loading States** - Skeleton loaders untuk semua data fetching
- **Form Validation** - Real-time validation dengan Zod + react-hook-form
- **DatePicker** - shadcn DatePicker untuk semua input tanggal
- **Combobox** - Searchable dropdown untuk select dengan banyak opsi
- **Status Badges** - Warna berbeda untuk setiap status

## 📊 Mock Data

Mock data dibuat dengan kompleksitas domain asuransi:

- **Relasi antar entitas** (Policy → InsuredPerson, Agent)
- **Field kompleks** (string, number, enum, date, nested object, array)
- **Status realistis** (ACTIVE, PENDING_MEDICAL, LAPSED, dll)
- **Unique ID + timestamp** pada semua entitas

## 📄 License

Private - PT BRI Life Frontend Technical Test
