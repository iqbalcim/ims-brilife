import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(5, 'Alamat minimal 5 karakter'),
  rt: z.string().optional(),
  rw: z.string().optional(),
  kelurahan: z.string().min(2, 'Kelurahan wajib diisi'),
  kecamatan: z.string().min(2, 'Kecamatan wajib diisi'),
  city: z.string().min(2, 'Kota wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().regex(/^\d{5}$/, 'Kode pos harus 5 digit'),
});

export const beneficiarySchema = z.object({
  name: z.string().min(3, 'Nama penerima manfaat minimal 3 karakter'),
  relationship: z.string().min(1, 'Hubungan wajib dipilih'),
  identityNumber: z.string().min(10, 'Nomor identitas minimal 10 karakter'),
  phoneNumber: z.string().min(10, 'Format nomor telepon tidak valid'),
  percentage: z.number().min(1, 'Minimal 1%').max(100, 'Maksimal 100%'),
  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi'),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const insuredPersonSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),

  gender: z.string().min(1, 'Jenis kelamin wajib dipilih'),

  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi'),

  placeOfBirth: z.string().min(2, 'Tempat lahir wajib diisi'),

  maritalStatus: z.string().min(1, 'Status perkawinan wajib dipilih'),

  identityType: z.string().min(1, 'Jenis identitas wajib dipilih'),

  identityNumber: z.string().min(10, 'Nomor identitas minimal 10 karakter'),

  identityExpiry: z.string().optional(),

  email: z
    .string()
    .email('Format email tidak valid')
    .max(100, 'Email maksimal 100 karakter'),

  phoneNumber: z.string().min(10, 'Nomor telepon minimal 10 digit'),

  address: addressSchema,

  occupation: z.string().min(2, 'Pekerjaan wajib diisi'),

  companyName: z.string().optional(),

  monthlyIncome: z.string().min(1, 'Pendapatan bulanan wajib dipilih'),

  height: z
    .number()
    .min(100, 'Tinggi badan minimal 100 cm')
    .max(250, 'Tinggi badan maksimal 250 cm'),

  weight: z
    .number()
    .min(30, 'Berat badan minimal 30 kg')
    .max(200, 'Berat badan maksimal 200 kg'),

  isSmoker: z.boolean(),

  hasChronicIllness: z.boolean(),

  chronicIllnessDetails: z.string().optional(),
});

export type InsuredPersonFormValues = z.infer<typeof insuredPersonSchema>;

export const policySchema = z.object({
  policyNumber: z.string().optional(),

  productCode: z.string().min(1, 'Jenis produk wajib dipilih'),

  productName: z.string().min(3, 'Nama produk minimal 3 karakter'),

  insuredPersonId: z.string().min(1, 'Tertanggung wajib dipilih'),

  agentId: z.string().min(1, 'Agen wajib dipilih'),

  premiumAmount: z
    .number()
    .min(100000, 'Premi minimal Rp 100.000')
    .max(100000000, 'Premi maksimal Rp 100.000.000'),

  premiumFrequency: z.string().min(1, 'Frekuensi pembayaran wajib dipilih'),

  sumAssured: z
    .number()
    .min(50000000, 'Uang pertanggungan minimal Rp 50.000.000')
    .max(10000000000, 'Uang pertanggungan maksimal Rp 10.000.000.000'),

  applicationDate: z.string().min(1, 'Tanggal aplikasi wajib diisi'),

  effectiveDate: z.string().min(1, 'Tanggal efektif wajib diisi'),

  maturityDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),

  status: z.string().min(1, 'Status wajib diisi'),

  beneficiaries: z
    .array(beneficiarySchema)
    .min(1, 'Minimal 1 penerima manfaat'),

  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

export type PolicyFormValues = z.infer<typeof policySchema>;

export const fileUploadSchema = z.object({
  type: z.string().min(1, 'Tipe dokumen wajib dipilih'),
});

export type FileUploadFormValues = z.infer<typeof fileUploadSchema>;
