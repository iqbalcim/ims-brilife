import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { Policy, PolicyStatus } from '@/types'

export interface UsePolicyFilters {
  search?: string
  status?: PolicyStatus | 'ALL'
  productCode?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UsePolicyResult {
  // Data
  policies: Policy[]
  filteredPolicies: Policy[]
  selectedPolicy: Policy | null
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // CRUD operations
  fetchPolicies: () => Promise<void>
  fetchPolicyById: (id: string) => Promise<Policy | null>
  createPolicy: (data: Partial<Policy>) => Promise<Policy | null>
  updatePolicy: (id: string, data: Partial<Policy>) => Promise<Policy | null>
  deletePolicy: (id: string) => Promise<boolean>
  
  // Filtering & Sorting
  filters: UsePolicyFilters
  setFilters: (filters: UsePolicyFilters) => void
  applyFilters: (policies: Policy[], filters: UsePolicyFilters) => Policy[]
  
  // Selection
  selectPolicy: (policy: Policy | null) => void
  
  // Stats
  stats: PolicyStats | null
  fetchStats: () => Promise<void>
}

interface PolicyStats {
  total: number
  active: number
  pending: number
  lapsed: number
  terminated: number
  totalPremium: number
  totalSumAssured: number
  byProductCode: Record<string, number>
}

/**
 * Custom hook for Policy CRUD operations
 * Handles all policy-related API calls and state management
 * 
 * @example
 * const { policies, isLoading, fetchPolicies, createPolicy, deletePolicy } = usePolicy()
 * 
 * useEffect(() => {
 *   fetchPolicies()
 * }, [fetchPolicies])
 */
export function usePolicy(): UsePolicyResult {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [stats, setStats] = useState<PolicyStats | null>(null)
  const [filters, setFilters] = useState<UsePolicyFilters>({})
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Apply filters and sorting
  const applyFilters = useCallback(
    (items: Policy[], currentFilters: UsePolicyFilters): Policy[] => {
      let result = [...items]

      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase()
        result = result.filter(
          (policy) =>
            policy.policyNumber.toLowerCase().includes(searchLower) ||
            policy.productName.toLowerCase().includes(searchLower)
        )
      }

      // Status filter
      if (currentFilters.status && currentFilters.status !== 'ALL') {
        result = result.filter((policy) => policy.status === currentFilters.status)
      }

      // Product code filter
      if (currentFilters.productCode) {
        result = result.filter((policy) => policy.productCode === currentFilters.productCode)
      }

      // Sorting
      if (currentFilters.sortBy) {
        result.sort((a, b) => {
          const aVal = a[currentFilters.sortBy as keyof Policy]
          const bVal = b[currentFilters.sortBy as keyof Policy]
          
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

  const filteredPolicies = applyFilters(policies, filters)

  // Fetch all policies
  const fetchPolicies = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/policies')
      const data = await response.json()
      
      if (data.success) {
        setPolicies(data.data)
      } else {
        toast.error(data.message || 'Gagal memuat data polis')
      }
    } catch (error) {
      toast.error('Gagal memuat data polis')
      console.error('fetchPolicies error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch policy by ID
  const fetchPolicyById = useCallback(async (id: string): Promise<Policy | null> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/policies/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        toast.error(data.message || 'Polis tidak ditemukan')
        return null
      }
    } catch (error) {
      toast.error('Gagal memuat data polis')
      console.error('fetchPolicyById error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create new policy
  const createPolicy = useCallback(async (data: Partial<Policy>): Promise<Policy | null> => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('Polis berhasil dibuat')
        setPolicies((prev) => [...prev, result.data])
        return result.data
      } else {
        toast.error(result.message || 'Gagal membuat polis')
        return null
      }
    } catch (error) {
      toast.error('Gagal membuat polis')
      console.error('createPolicy error:', error)
      return null
    } finally {
      setIsCreating(false)
    }
  }, [])

  // Update existing policy
  const updatePolicy = useCallback(
    async (id: string, data: Partial<Policy>): Promise<Policy | null> => {
      setIsUpdating(true)
      try {
        const response = await fetch(`/api/policies/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        
        if (result.success) {
          toast.success('Polis berhasil diperbarui')
          setPolicies((prev) =>
            prev.map((p) => (p.id === id ? result.data : p))
          )
          return result.data
        } else {
          toast.error(result.message || 'Gagal memperbarui polis')
          return null
        }
      } catch (error) {
        toast.error('Gagal memperbarui polis')
        console.error('updatePolicy error:', error)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  // Delete policy
  const deletePolicy = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('Polis berhasil dihapus')
        setPolicies((prev) => prev.filter((p) => p.id !== id))
        return true
      } else {
        toast.error(result.message || 'Gagal menghapus polis')
        return false
      }
    } catch (error) {
      toast.error('Gagal menghapus polis')
      console.error('deletePolicy error:', error)
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/policies/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('fetchStats error:', error)
    }
  }, [])

  return {
    policies,
    filteredPolicies,
    selectedPolicy,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchPolicies,
    fetchPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    filters,
    setFilters,
    applyFilters,
    selectPolicy: setSelectedPolicy,
    stats,
    fetchStats,
  }
}
