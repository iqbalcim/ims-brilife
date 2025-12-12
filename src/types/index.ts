export type ProductCode =
  | 'WHOLE_LIFE'
  | 'TERM_LIFE'
  | 'UNIT_LINK'
  | 'ENDOWMENT'
  | 'HEALTH';

export type PremiumFrequency =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL'
  | 'ANNUAL';

// Status Polis sesuai lifecycle asuransi jiwa Indonesia
export type PolicyStatus =
  | 'DRAFT' // SPAJ baru diisi
  | 'SUBMITTED' // SPAJ sudah dikirim ke underwriting
  | 'PENDING_MEDICAL' // Menunggu hasil medical check-up
  | 'PENDING_DOCUMENT' // Menunggu kelengkapan dokumen
  | 'PENDING_APPROVAL' // Dalam proses underwriting
  | 'APPROVED' // Disetujui, menunggu premi pertama
  | 'ACTIVE' // Polis aktif, coverage berjalan
  | 'LAPSED' // Premi tidak dibayar melebihi grace period
  | 'REINSTATEMENT' // Dalam proses reaktivasi setelah lapse
  | 'PAID_UP' // Premi dihentikan, coverage tetap dengan nilai rendah
  | 'SURRENDER' // Polis dicairkan sebelum jatuh tempo
  | 'CLAIM_PROCESS' // Dalam proses klaim
  | 'TERMINATED'; // Polis berakhir (meninggal/maturity)

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

export type IdentityType = 'KTP' | 'SIM' | 'PASSPORT';

export type Gender = 'MALE' | 'FEMALE';

// Hubungan penerima manfaat sesuai domain Indonesia
export type Relationship =
  | 'SUAMI'
  | 'ISTRI'
  | 'ANAK'
  | 'ORANG_TUA'
  | 'SAUDARA'
  | 'LAINNYA';

export type BeneficiaryType = 'PRIMARY' | 'CONTINGENT';

export type IncomeRange =
  | 'BELOW_5M'
  | '5M_10M'
  | '10M_25M'
  | '25M_50M'
  | 'ABOVE_50M';

export type DocumentType =
  | 'KTP'
  | 'KK'
  | 'PHOTO'
  | 'MEDICAL_REPORT'
  | 'POLICY_DOC'
  | 'PAYMENT_PROOF'
  | 'BIRTH_CERT'
  // Policy documents
  | 'SPAJ'
  | 'POLIS_TERBIT'
  | 'ILUSTRASI_PRODUK'
  | 'FORMULIR_PERUBAHAN'
  | 'SURAT_KUASA_DEBIT'
  // Insured person documents
  | 'NPWP'
  | 'PAS_FOTO'
  | 'SKD' // Surat Keterangan Dokter
  // Payment documents
  | 'BUKTI_TRANSFER'
  | 'KWITANSI'
  | 'INVOICE'
  | 'SLIP_SETORAN';

export type PersonStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserRole = 'ADMIN' | 'AGENT';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'VIRTUAL_ACCOUNT'
  | 'AUTO_DEBIT'
  | 'CREDIT_CARD';

// Status pembayaran premi
export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'FAILED'
  | 'REFUNDED';

export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Data?: string;
  uploadedAt: string;
}

export interface Address {
  street: string;
  rt?: string;
  rw?: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: Relationship;
  identityNumber: string;
  phoneNumber: string;
  percentage: number;
  dateOfBirth: string;
  beneficiaryType: BeneficiaryType; // PRIMARY atau CONTINGENT
}

export interface InsuredPerson {
  id: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  placeOfBirth: string;
  maritalStatus: MaritalStatus;
  identityType: IdentityType;
  identityNumber: string;
  identityExpiry?: string;
  email: string;
  phoneNumber: string;
  address: Address;
  occupation: string;
  companyName?: string;
  monthlyIncome: IncomeRange;
  height: number;
  weight: number;
  isSmoker: boolean;
  hasChronicIllness: boolean;
  chronicIllnessDetails?: string;
  documents: Document[];
  status: PersonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  agentCode: string;
  fullName: string;
  email: string;
  phone: string;
  // Lisensi AAJI (wajib untuk agen asuransi jiwa Indonesia)
  licenseNumber: string; // No. Lisensi AAJI
  licenseExpiry: string; // Tanggal expired (berlaku 2 tahun)
  level: 'ASSOCIATE' | 'SENIOR' | 'AGENCY_MANAGER';
  branchCode: string;
  branchName: string;
  joinDate: string;
  status: AgentStatus;
  // Performance metrics
  totalPremiumYTD: number; // Total premi tahun ini
  totalPolicies: number; // Jumlah polis yang dijual
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  productCode: ProductCode;
  productName: string;
  insuredPersonId: string;
  insuredPerson?: InsuredPerson;
  agentId: string;
  agent?: Agent;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  sumAssured: number;
  applicationDate: string;
  effectiveDate: string;
  maturityDate: string;
  status: PolicyStatus;
  beneficiaries: Beneficiary[];
  documents: Document[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PremiumPayment {
  id: string;
  paymentNumber: string;
  policyId: string;
  policy?: Policy;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  receiptNumber?: string;
  notes?: string;
  // Domain-specific fields
  periodNumber: number; // Pembayaran ke-berapa (1, 2, 3...)
  gracePeriodEnd?: string; // Akhir masa tenggang (45-90 hari setelah due date)
  bankName?: string; // Nama bank (jika transfer)
  referenceNumber?: string; // No referensi bank
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  agentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: Omit<User, 'password'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PolicyFormData {
  policyNumber?: string;
  productCode: ProductCode;
  productName: string;
  insuredPersonId: string;
  agentId: string;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  sumAssured: number;
  applicationDate: string;
  effectiveDate: string;
  maturityDate: string;
  status: PolicyStatus;
  beneficiaries: Omit<Beneficiary, 'id'>[];
  notes?: string;
}

export interface InsuredPersonFormData {
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  placeOfBirth: string;
  maritalStatus: MaritalStatus;
  identityType: IdentityType;
  identityNumber: string;
  identityExpiry?: string;
  email: string;
  phoneNumber: string;
  address: Address;
  occupation: string;
  companyName?: string;
  monthlyIncome: IncomeRange;
  height: number;
  weight: number;
  isSmoker: boolean;
  hasChronicIllness: boolean;
  chronicIllnessDetails?: string;
}

export interface PolicyFilters {
  search?: string;
  status?: PolicyStatus;
  productCode?: ProductCode;
  dateFrom?: string;
  dateTo?: string;
}

export interface InsuredPersonFilters {
  search?: string;
  status?: PersonStatus;
  gender?: Gender;
  city?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface PaginationConfig {
  page: number;
  limit: number;
}
