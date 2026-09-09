import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

export function SuspenseQueryBoundary({
  fallback,
  loadingFallback,
  children,
}: React.PropsWithChildren & {
  fallback: React.ComponentType<FallbackProps>
  loadingFallback: ReactNode
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary FallbackComponent={fallback} onReset={reset}>
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
