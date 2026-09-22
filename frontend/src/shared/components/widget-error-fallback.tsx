import { type FallbackProps } from 'react-error-boundary'

import { cn } from '@/shared/lib'
import { getErrorMessage, isRetryableError } from '@/shared/utilities'

import { Button } from './ui'

export function WidgetErrorFallback({
  error,
  resetErrorBoundary,
  className,
  message,
}: FallbackProps & {
  className?: string
  message?: string
}) {
  return (
    <div className={cn('text-muted-foreground grid space-y-4', className)}>
      <pre>{message ?? getErrorMessage(error)}</pre>

      {isRetryableError(error) && (
        <Button variant="secondary" onClick={resetErrorBoundary}>
          Retry
        </Button>
      )}
    </div>
  )
}
