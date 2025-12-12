import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { InsuredPerson, Gender } from '@/types'

export interface UseInsuredPersonFilters {
  search?: string
  gender?: Gender | 'ALL'
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL'
  isSmoker?: boolean | 'ALL'
  hasChronicIllness?: boolean | 'ALL'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UseInsuredPersonResult {
  // Data
  insuredPersons: InsuredPerson[]
  filteredInsuredPersons: InsuredPerson[]
  selectedPerson: InsuredPerson | null
  
  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // CRUD operations
  fetchInsuredPersons: () => Promise<void>
  fetchInsuredPersonById: (id: string) => Promise<InsuredPerson | null>
  createInsuredPerson: (data: Partial<InsuredPerson>) => Promise<InsuredPerson | null>
  updateInsuredPerson: (id: string, data: Partial<InsuredPerson>) => Promise<InsuredPerson | null>
  deleteInsuredPerson: (id: string) => Promise<boolean>
  
  // Document operations
  uploadDocument: (personId: string, file: File, type: string) => Promise<boolean>
  deleteDocument: (personId: string, docId: string) => Promise<boolean>
  
  // Filtering & Sorting
  filters: UseInsuredPersonFilters
  setFilters: (filters: UseInsuredPersonFilters) => void
  applyFilters: (persons: InsuredPerson[], filters: UseInsuredPersonFilters) => InsuredPerson[]
  
  // Selection
  selectPerson: (person: InsuredPerson | null) => void
  
  // Stats
  stats: InsuredPersonStats | null
  fetchStats: () => Promise<void>
}

interface InsuredPersonStats {
  total: number
  active: number
  inactive: number
  byGender: { male: number; female: number }
  smokers: number
  withChronicIllness: number
}

/**
 * Custom hook for InsuredPerson CRUD operations
 * Handles all insured person-related API calls and state management
 * 
 * @example
 * const { insuredPersons, isLoading, fetchInsuredPersons, createInsuredPerson } = useInsuredPerson()
 */
export function useInsuredPerson(): UseInsuredPersonResult {
  const [insuredPersons, setInsuredPersons] = useState<InsuredPerson[]>([])
  const [selectedPerson, setSelectedPerson] = useState<InsuredPerson | null>(null)
  const [stats, setStats] = useState<InsuredPersonStats | null>(null)
  const [filters, setFilters] = useState<UseInsuredPersonFilters>({})
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Apply filters and sorting
  const applyFilters = useCallback(
    (items: InsuredPerson[], currentFilters: UseInsuredPersonFilters): InsuredPerson[] => {
      let result = [...items]

      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase()
        result = result.filter(
          (person) =>
            person.fullName.toLowerCase().includes(searchLower) ||
            person.identityNumber.toLowerCase().includes(searchLower) ||
            person.email.toLowerCase().includes(searchLower)
        )
      }

      // Gender filter
      if (currentFilters.gender && currentFilters.gender !== 'ALL') {
        result = result.filter((person) => person.gender === currentFilters.gender)
      }

      // Status filter
      if (currentFilters.status && currentFilters.status !== 'ALL') {
        result = result.filter((person) => person.status === currentFilters.status)
      }

      // Smoker filter
      if (currentFilters.isSmoker !== undefined && currentFilters.isSmoker !== 'ALL') {
        result = result.filter((person) => person.isSmoker === currentFilters.isSmoker)
      }

      // Chronic illness filter
      if (currentFilters.hasChronicIllness !== undefined && currentFilters.hasChronicIllness !== 'ALL') {
        result = result.filter((person) => person.hasChronicIllness === currentFilters.hasChronicIllness)
      }

      // Sorting
      if (currentFilters.sortBy) {
        result.sort((a, b) => {
          const aVal = a[currentFilters.sortBy as keyof InsuredPerson]
          const bVal = b[currentFilters.sortBy as keyof InsuredPerson]
          
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

  const filteredInsuredPersons = applyFilters(insuredPersons, filters)

  // Fetch all insured persons
  const fetchInsuredPersons = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/insured-persons')
      const data = await response.json()
      
      if (data.success) {
        setInsuredPersons(data.data)
      } else {
        toast.error(data.message || 'Gagal memuat data tertanggung')
      }
    } catch (error) {
      toast.error('Gagal memuat data tertanggung')
      console.error('fetchInsuredPersons error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch by ID
  const fetchInsuredPersonById = useCallback(async (id: string): Promise<InsuredPerson | null> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/insured-persons/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        toast.error(data.message || 'Tertanggung tidak ditemukan')
        return null
      }
    } catch (error) {
      toast.error('Gagal memuat data tertanggung')
      console.error('fetchInsuredPersonById error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create
  const createInsuredPerson = useCallback(
    async (data: Partial<InsuredPerson>): Promise<InsuredPerson | null> => {
      setIsCreating(true)
      try {
        const response = await fetch('/api/insured-persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        
        if (result.success) {
          toast.success('Tertanggung berhasil ditambahkan')
          setInsuredPersons((prev) => [...prev, result.data])
          return result.data
        } else {
          toast.error(result.message || 'Gagal menambahkan tertanggung')
          return null
        }
      } catch (error) {
        toast.error('Gagal menambahkan tertanggung')
        console.error('createInsuredPerson error:', error)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    []
  )

  // Update
  const updateInsuredPerson = useCallback(
    async (id: string, data: Partial<InsuredPerson>): Promise<InsuredPerson | null> => {
      setIsUpdating(true)
      try {
        const response = await fetch(`/api/insured-persons/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const result = await response.json()
        
        if (result.success) {
          toast.success('Tertanggung berhasil diperbarui')
          setInsuredPersons((prev) =>
            prev.map((p) => (p.id === id ? result.data : p))
          )
          return result.data
        } else {
          toast.error(result.message || 'Gagal memperbarui tertanggung')
          return null
        }
      } catch (error) {
        toast.error('Gagal memperbarui tertanggung')
        console.error('updateInsuredPerson error:', error)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    []
  )

  // Delete
  const deleteInsuredPerson = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/insured-persons/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        toast.success('Tertanggung berhasil dihapus')
        setInsuredPersons((prev) => prev.filter((p) => p.id !== id))
        return true
      } else {
        toast.error(result.message || 'Gagal menghapus tertanggung')
        return false
      }
    } catch (error) {
      toast.error('Gagal menghapus tertanggung')
      console.error('deleteInsuredPerson error:', error)
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Upload document
  const uploadDocument = useCallback(
    async (personId: string, file: File, type: string): Promise<boolean> => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        
        const response = await fetch(`/api/insured-persons/${personId}/documents`, {
          method: 'POST',
          body: formData,
        })
        const result = await response.json()
        
        if (result.success) {
          toast.success('Dokumen berhasil diunggah')
          return true
        } else {
          toast.error(result.message || 'Gagal mengunggah dokumen')
          return false
        }
      } catch (error) {
        toast.error('Gagal mengunggah dokumen')
        console.error('uploadDocument error:', error)
        return false
      }
    },
    []
  )

  // Delete document
  const deleteDocument = useCallback(
    async (personId: string, docId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/insured-persons/${personId}/documents/${docId}`,
          { method: 'DELETE' }
        )
        const result = await response.json()
        
        if (result.success) {
          toast.success('Dokumen berhasil dihapus')
          return true
        } else {
          toast.error(result.message || 'Gagal menghapus dokumen')
          return false
        }
      } catch (error) {
        toast.error('Gagal menghapus dokumen')
        console.error('deleteDocument error:', error)
        return false
      }
    },
    []
  )

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/insured-persons/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('fetchStats error:', error)
    }
  }, [])

  return {
    insuredPersons,
    filteredInsuredPersons,
    selectedPerson,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchInsuredPersons,
    fetchInsuredPersonById,
    createInsuredPerson,
    updateInsuredPerson,
    deleteInsuredPerson,
    uploadDocument,
    deleteDocument,
    filters,
    setFilters,
    applyFilters,
    selectPerson: setSelectedPerson,
    stats,
    fetchStats,
  }
}
