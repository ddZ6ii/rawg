import { type FallbackProps } from 'react-error-boundary'

import { Button } from '@/shared/components/ui/button'
import { getErrorMessage, isRetryableError } from '@/shared/utilities'

export function GameErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div className="grid h-full place-content-center justify-items-center space-y-4 p-2">
      <pre>{getErrorMessage(error)}</pre>

      {isRetryableError(error) && (
        <Button variant="secondary" onClick={resetErrorBoundary}>
          Retry
        </Button>
      )}
    </div>
  )
}
