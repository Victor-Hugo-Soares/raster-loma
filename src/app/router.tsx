import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import AppShell from '@/shared/components/AppShell'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import InstalacoesPage from '@/pages/InstalacoesPage'
import TecnicosPage from '@/pages/TecnicosPage'
import FinanceiroPage from '@/pages/FinanceiroPage'
import AlertasPage from '@/pages/AlertasPage'
import EquipamentosPage from '@/pages/EquipamentosPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground font-mono">carregando...</span>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/instalacoes" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'instalacoes', element: <InstalacoesPage /> },
      { path: 'tecnicos', element: <TecnicosPage /> },
      { path: 'financeiro', element: <FinanceiroPage /> },
      { path: 'alertas', element: <AlertasPage /> },
      { path: 'equipamentos', element: <EquipamentosPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function Router() {
  return <RouterProvider router={router} />
}
