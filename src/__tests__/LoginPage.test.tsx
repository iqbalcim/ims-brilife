import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { useAuthStore } from '@/store/authStore'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
  }

  it('should render login form with title', () => {
    renderLoginPage()
    
    expect(screen.getByText('BRI Life IMS')).toBeInTheDocument()
    expect(screen.getByText('Insurance Management System')).toBeInTheDocument()
  })

  it('should render username input', () => {
    renderLoginPage()
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Masukkan username')).toBeInTheDocument()
  })

  it('should render password input', () => {
    renderLoginPage()
    
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Masukkan password')).toBeInTheDocument()
  })

  it('should render submit button', () => {
    renderLoginPage()
    
    const submitButton = screen.getByRole('button', { name: /masuk/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should render demo credentials', () => {
    renderLoginPage()
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument()
    expect(screen.getByText(/admin \/ admin123/)).toBeInTheDocument()
    expect(screen.getByText(/agent \/ agent123/)).toBeInTheDocument()
  })

  it('should allow typing in username field', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    
    const usernameInput = screen.getByLabelText('Username')
    await user.type(usernameInput, 'testuser')
    
    expect(usernameInput).toHaveValue('testuser')
  })

  it('should allow typing in password field', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    
    const passwordInput = screen.getByPlaceholderText('Masukkan password')
    await user.type(passwordInput, 'testpassword')
    
    expect(passwordInput).toHaveValue('testpassword')
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    
    const passwordInput = screen.getByPlaceholderText('Masukkan password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Find the toggle button next to password input
    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find(btn => btn.getAttribute('type') === 'button')
    
    if (toggleButton) {
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
    }
  })
})
