import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  policySchema,
  insuredPersonSchema,
} from '@/lib/validators';

describe('Login Schema', () => {
  it('should validate correct login credentials', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      password: 'admin123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty username', () => {
    const result = loginSchema.safeParse({
      username: '',
      password: 'admin123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('username');
    }
  });

  it('should reject short username', () => {
    const result = loginSchema.safeParse({
      username: 'ab',
      password: 'admin123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      username: 'admin',
      password: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });
});

describe('Policy Schema', () => {
  const validPolicy = {
    productCode: 'TERM_LIFE',
    productName: 'BRILife Proteksi',
    insuredPersonId: 'person-1',
    agentId: 'agent-1',
    premiumAmount: 500000,
    premiumFrequency: 'MONTHLY',
    sumAssured: 100000000,
    applicationDate: '2025-01-01',
    effectiveDate: '2025-02-01',
    maturityDate: '2035-02-01',
    status: 'DRAFT',
    beneficiaries: [
      {
        name: 'John Doe',
        relationship: 'SPOUSE',
        identityNumber: '1234567890123456',
        phoneNumber: '08123456789',
        percentage: 100,
        dateOfBirth: '1990-01-01',
      },
    ],
  };

  it('should validate correct policy data', () => {
    const result = policySchema.safeParse(validPolicy);
    expect(result.success).toBe(true);
  });

  it('should reject policy without product code', () => {
    const result = policySchema.safeParse({
      ...validPolicy,
      productCode: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject policy with premium below minimum', () => {
    const result = policySchema.safeParse({
      ...validPolicy,
      premiumAmount: 50000, // Below 100000 minimum
    });
    expect(result.success).toBe(false);
  });

  it('should reject policy without beneficiaries', () => {
    const result = policySchema.safeParse({
      ...validPolicy,
      beneficiaries: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('Insured Person Schema', () => {
  const validPerson = {
    fullName: 'John Doe',
    gender: 'MALE',
    dateOfBirth: '1990-01-01',
    placeOfBirth: 'Jakarta',
    maritalStatus: 'SINGLE',
    identityType: 'KTP',
    identityNumber: '1234567890123456',
    email: 'john@example.com',
    phoneNumber: '08123456789',
    address: {
      street: 'Jl. Test No. 123',
      kelurahan: 'Menteng',
      kecamatan: 'Menteng',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
    },
    occupation: 'Software Engineer',
    monthlyIncome: '10M_25M',
    height: 175,
    weight: 70,
    isSmoker: false,
    hasChronicIllness: false,
  };

  it('should validate correct insured person data', () => {
    const result = insuredPersonSchema.safeParse(validPerson);
    expect(result.success).toBe(true);
  });

  it('should reject person with short name', () => {
    const result = insuredPersonSchema.safeParse({
      ...validPerson,
      fullName: 'Jo',
    });
    expect(result.success).toBe(false);
  });

  it('should reject person with invalid email', () => {
    const result = insuredPersonSchema.safeParse({
      ...validPerson,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('should reject person with invalid postal code', () => {
    const result = insuredPersonSchema.safeParse({
      ...validPerson,
      address: {
        ...validPerson.address,
        postalCode: '123', // Should be 5 digits
      },
    });
    expect(result.success).toBe(false);
  });

  it('should reject person with height outside valid range', () => {
    const result = insuredPersonSchema.safeParse({
      ...validPerson,
      height: 50, // Below 100cm minimum
    });
    expect(result.success).toBe(false);
  });
});
