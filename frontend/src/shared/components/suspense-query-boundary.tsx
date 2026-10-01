import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Suspense, type ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

export function SuspenseQueryBoundary({
  fallback,
  loadingFallback,
  resetKeys,
  children,
}: React.PropsWithChildren & {
  fallback: React.ComponentType<FallbackProps>
  loadingFallback: ReactNode
  /** Resets the error state (and retries the queries) when any key changes. */
  resetKeys?: unknown[]
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={fallback}
          onReset={reset}
          resetKeys={resetKeys}
        >
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
