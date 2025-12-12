import { Sidebar } from '@/components/layout/Sidebar'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

describe('Sidebar', () => {
  const mockOnToggle = () => { }

  const renderSidebar = (isCollapsed = false) => {
    return render(
      <BrowserRouter>
        <Sidebar isCollapsed={isCollapsed} onToggle={mockOnToggle} />
      </BrowserRouter>
    )
  }

  it('should render the logo', () => {
    renderSidebar()
    expect(screen.getByText('BRI Life IMS')).toBeInTheDocument()
  })

  it('should render navigation items', () => {
    renderSidebar()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Polis')).toBeInTheDocument()
    expect(screen.getByText('Tertanggung')).toBeInTheDocument()
    expect(screen.getByText('Pembayaran')).toBeInTheDocument()
    expect(screen.getByText('Agen')).toBeInTheDocument()
  })

  it('should have correct links for navigation items', () => {
    renderSidebar()

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')

    const polisLink = screen.getByText('Polis').closest('a')
    expect(polisLink).toHaveAttribute('href', '/policies')

    const tertanggungLink = screen.getByText('Tertanggung').closest('a')
    expect(tertanggungLink).toHaveAttribute('href', '/insured-persons')

    const pembayaranLink = screen.getByText('Pembayaran').closest('a')
    expect(pembayaranLink).toHaveAttribute('href', '/premium-payments')

    const agenLink = screen.getByText('Agen').closest('a')
    expect(agenLink).toHaveAttribute('href', '/agents')
  })

  it('should show toggle button with "Tutup" text when expanded', () => {
    renderSidebar(false)
    expect(screen.getByText('Tutup')).toBeInTheDocument()
  })

  it('should hide navigation text when collapsed', () => {
    renderSidebar(true)
    // Logo text should not be visible
    expect(screen.queryByText('BRI Life IMS')).not.toBeInTheDocument()
    // Navigation text should not be visible
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Polis')).not.toBeInTheDocument()
  })

  it('should have correct width class when expanded', () => {
    const { container } = renderSidebar(false)
    const aside = container.querySelector('aside')
    expect(aside?.className).toContain('w-64')
  })

  it('should have correct width class when collapsed', () => {
    const { container } = renderSidebar(true)
    const aside = container.querySelector('aside')
    expect(aside?.className).toContain('w-16')
  })

  it('should render icons for all navigation items', () => {
    const { container } = renderSidebar()
    // Check that SVG icons are present in navigation
    const navSection = container.querySelector('nav')
    const svgIcons = navSection?.querySelectorAll('svg')
    expect(svgIcons?.length).toBe(5)
  })
})
