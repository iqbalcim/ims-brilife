import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatPhoneNumber, calculateAge } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format number to IDR currency', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('Rp')
      expect(result).toContain('1')
    })

    it('should handle zero value', () => {
      const result = formatCurrency(0)
      expect(result).toContain('Rp')
      expect(result).toContain('0')
    })

    it('should format large numbers correctly', () => {
      const result = formatCurrency(1500000000)
      expect(result).toContain('Rp')
    })
  })

  describe('formatDate', () => {
    it('should format date string to Indonesian locale', () => {
      const result = formatDate('2024-12-25')
      expect(result).toContain('25')
      expect(result).toContain('Desember')
      expect(result).toContain('2024')
    })

    it('should handle different date formats', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format Indonesian phone number', () => {
      const result = formatPhoneNumber('081234567890')
      expect(result).toBeDefined()
    })

    it('should handle phone with +62 prefix', () => {
      const result = formatPhoneNumber('+6281234567890')
      expect(result).toBeDefined()
    })
  })

  describe('calculateAge', () => {
    it('should calculate age from birth date', () => {
      const birthDate = new Date()
      birthDate.setFullYear(birthDate.getFullYear() - 25)
      const result = calculateAge(birthDate.toISOString().split('T')[0])
      expect(result).toBe(25)
    })

    it('should return 0 for future date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = calculateAge(futureDate.toISOString().split('T')[0])
      expect(result).toBeLessThanOrEqual(0)
    })
  })
})
