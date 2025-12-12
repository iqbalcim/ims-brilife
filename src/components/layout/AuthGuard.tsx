import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const location = useLocation()

  // Check if token is still valid
  const isValid = checkAuth()

  if (!isAuthenticated || !isValid) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
