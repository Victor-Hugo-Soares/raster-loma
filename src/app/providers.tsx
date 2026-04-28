import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode, useState } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/shared/hooks/useAuth'
import { usePushNotification } from '@/shared/hooks/usePushNotification'

function PushNotificationInit() {
  usePushNotification()
  return null
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60, retry: 1 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PushNotificationInit />
        {children}
        <Toaster
          theme="dark"
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(213 48% 9%)',
              border: '1px solid hsl(213 38% 17%)',
              color: 'hsl(210 26% 92%)',
            },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
