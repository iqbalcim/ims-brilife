import { useState, useMemo, useCallback } from 'react'

export interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export interface PaginationResult<T> {
  // Data
  currentItems: T[]
  totalItems: number
  totalPages: number
  
  // Current state
  currentPage: number
  pageSize: number
  
  // Navigation
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
  
  // Info
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPrevPage: boolean
  
  // Options
  pageSizeOptions: number[]
}

/**
 * Custom hook for client-side pagination
 * Handles all pagination logic including page navigation and page size changes
 * 
 * @param items - Array of items to paginate
 * @param options - Pagination options
 * @returns PaginationResult with paginated data and navigation functions
 * 
 * @example
 * const { currentItems, currentPage, totalPages, goToPage, nextPage, prevPage } = usePagination(policies)
 * 
 * // Render current page items
 * currentItems.map(item => <Row key={item.id} {...item} />)
 * 
 * // Pagination controls
 * <button onClick={prevPage} disabled={!hasPrevPage}>Prev</button>
 * <span>{currentPage} / {totalPages}</span>
 * <button onClick={nextPage} disabled={!hasNextPage}>Next</button>
 */
export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Calculate current items for the page
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return items.slice(start, end)
  }, [items, currentPage, pageSize])

  // Calculate indices for display
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages))
      setCurrentPage(validPage)
    },
    [totalPages]
  )

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [currentPage])

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size)
      // Reset to first page when changing page size
      setCurrentPage(1)
    },
    []
  )

  // Ensure current page is valid when items change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return {
    currentItems,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    pageSizeOptions,
  }
}
