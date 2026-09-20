import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'

import './index.css'

import { App } from '@/app.tsx'
import {
  isRetryableError,
  RootErrorFallback,
  ThemeContextProvider,
  TooltipProvider,
} from '@/shared'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent staleness-based refetches since data is not expected to change (no mutations)
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error) =>
        isRetryableError(error) && failureCount < 3,
      throwOnError: false,
    },
  },
})

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary FallbackComponent={RootErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ThemeContextProvider>
              <App />
            </ThemeContextProvider>
          </TooltipProvider>
          <ReactQueryDevtools buttonPosition="bottom-right" />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}
