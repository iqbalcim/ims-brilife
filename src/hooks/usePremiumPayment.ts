import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { PremiumPayment, PaymentStatus, PaymentMethod } from '@/types'

export interface UsePremiumPaymentFilters {
  search?: string
  status?: PaymentStatus | 'ALL'
  method?: PaymentMethod | 'ALL'
  policyId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UsePremiumPaymentResult {
  // Data
  payments: PremiumPayment[]
  filteredPayments: PremiumPayment[]
  selectedPayment: PremiumPayment | null
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // CRUD operations
  fetchPayments: () => Promise<void>
  fetchPaymentById: (id: string) => Promise<PremiumPayment | null>
  createPayment: (data: Partial<PremiumPayment>) => Promise<PremiumPayment | null>
  updatePayment: (id: string, data: Partial<PremiumPayment>) => Promise<PremiumPayment | null>
  deletePayment: (id: string) => Promise<boolean>
  
  // Filtering & Sorting
  filters: UsePremiumPaymentFilters
  setFilters: (filters: UsePremiumPaymentFilters) => void
  applyFilters: (payments: PremiumPayment[], filters: UsePremiumPaymentFilters) => PremiumPayment[]
  
  // Selection
  selectPayment: (payment: PremiumPayment | null) => void
  
  // Stats
  stats: PaymentStats | null
  fetchStats: () => Promise<void>
}

interface PaymentStats {
  total: number
  totalAmount: number
  paid: number
  pending: number
  failed: number
  byMethod: Record<string, number>
}

/**
 * Custom hook for Premium Payment CRUD operations
 * Handles all payment-related API calls and state management
 * 
 * @example
 * const { payments, isLoading, fetchPayments, createPayment } = usePremiumPayment()
 */
export function usePremiumPayment(): UsePremiumPaymentResult {
  const [payments, setPayments] = useState<PremiumPayment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PremiumPayment | null>(null)
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [filters, setFilters] = useState<UsePremiumPaymentFilters>({})
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Apply filters and sorting
  const applyFilters = useCallback(
    (items: PremiumPayment[], currentFilters: UsePremiumPaymentFilters): PremiumPayment[] => {
      let result = [...items]

      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase()
        result = result.filter(
          (payment) =>
            payment.receiptNumber?.toLowerCase().includes(searchLower) ||
            payment.policy?.policyNumber.toLowerCase().includes(searchLower)
        )
      }

      // Status filter
      if (currentFilters.status && currentFilters.status !== 'ALL') {
        result = result.filter((payment) => payment.status === currentFilters.status)
      }

      // Method filter
      if (currentFilters.method && currentFilters.method !== 'ALL') {
        result = result.filter((payment) => payment.method === currentFilters.method)
      }

      // Policy filter
      if (currentFilters.policyId) {
        result = result.filter((payment) => payment.policyId === currentFilters.policyId)
      }

      // Date range filter
      if (currentFilters.dateFrom) {
        result = result.filter((payment) => (payment.paymentDate ?? '') >= currentFilters.dateFrom!)
      }
      if (currentFilters.dateTo) {
        result = result.filter((payment) => (payment.paymentDate ?? '') <= currentFilters.dateTo!)
      }

      // Sorting
      if (currentFilters.sortBy) {
        result.sort((a, b) => {
          const aVal = a[currentFilters.sortBy as keyof PremiumPayment]
          const bVal = b[currentFilters.sortBy as keyof PremiumPayment]
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return currentFilters.sortOrder === 'desc'
              ? bVal.localeCompare(aVal)
              : aVal.localeCompare(bVal)
          }
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return currentFilters.sortOrder === 'desc' ? bVal - aVal : aVal - bVal
          }
          
          return 0
        })
      }

      return result
    },
    []
  )

  const filteredPayments = applyFilters(payments, filters)

  // Fetch all payments
  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/premium-payments')
      const data = await response.json()
      
      if (data.success) {
        setPayments(data.data)
      } else {
        toast.error(data.message || 'Gagal memuat data pembayaran')
      }
    } catch (error) {
      toast.error('Gagal memuat data pembayaran')
      console.error('fetchPayments error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch by ID
  const fetchPaymentById = useCallback(async (id: string): Promise<PremiumPayment | null> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/premium-payments/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        toast.error(data.message || 'Pembayaran tidak ditemukan')
        return null
      }
    } catch (error) {
      toast.error('Gagal memuat data pembayaran')
      console.error('fetchPaymentById error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create
  const createPayment = useCallback(
    async (data: Partial<PremiumPayment>): Promise<PremiumPayment | null> => {
      setIsCreating(true)
      try {
        const response = await fetch('/api/premium-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        
        if (result.success) {
          toast.success('Pembayaran berhasil dicatat')
          setPayments((prev) => [...prev, result.data])
          return result.data
        } else {
          toast.error(result.message || 'Gagal mencatat pembayaran')
          return null
        }
      } catch (error) {
        toast.error('Gagal mencatat pembayaran')
        console.error('createPayment error:', error)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    []
  )

  // Update
  const updatePayment = useCallback(
    async (id: string, data: Partial<PremiumPayment>): Promise<PremiumPayment | null> => {
      setIsUpdating(true)
      try {
        const response = await fetch(`/api/premium-payments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        
        if (result.success) {
          toast.success('Pembayaran berhasil diperbarui')
          setPayments((prev) =>
            prev.map((p) => (p.id === id ? result.data : p))
          )
          return result.data
        } else {
          toast.error(result.message || 'Gagal memperbarui pembayaran')
          return null
        }
      } catch (error) {
        toast.error('Gagal memperbarui pembayaran')
        console.error('updatePayment error:', error)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  // Delete
  const deletePayment = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/premium-payments/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('Pembayaran berhasil dihapus')
        setPayments((prev) => prev.filter((p) => p.id !== id))
        return true
      } else {
        toast.error(result.message || 'Gagal menghapus pembayaran')
        return false
      }
    } catch (error) {
      toast.error('Gagal menghapus pembayaran')
      console.error('deletePayment error:', error)
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/premium-payments/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('fetchStats error:', error)
    }
  }, [])

  return {
    payments,
    filteredPayments,
    selectedPayment,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchPayments,
    fetchPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    filters,
    setFilters,
    applyFilters,
    selectPayment: setSelectedPayment,
    stats,
    fetchStats,
  }
}
