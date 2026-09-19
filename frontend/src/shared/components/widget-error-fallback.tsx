import { type FallbackProps } from 'react-error-boundary'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { getErrorMessage, isRetryableError } from '@/shared/utilities'

export function WidgetErrorFallback({
  error,
  resetErrorBoundary,
  className,
}: FallbackProps & {
  className?: string
}) {
  return (
    <div className={cn('grid place-content-center space-y-4 p-2', className)}>
      <pre>{getErrorMessage(error)}</pre>

      {isRetryableError(error) && (
        <Button variant="secondary" onClick={resetErrorBoundary}>
          Retry
        </Button>
      )}
    </div>
  )
}
