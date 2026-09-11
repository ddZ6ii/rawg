import type { FallbackProps } from 'react-error-boundary'

import { Button } from '@/shared/components/ui/button'

export function RootErrorFallback({ error }: FallbackProps) {
  return (
    <div className="grid min-h-dvh place-content-center justify-items-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong...</h1>

      <p className="text-muted-foreground">
        Please try reloading the page. If this keeps happening, let us know.
      </p>

      {import.meta.env.DEV && (
        <pre className="text-destructive text-sm">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      )}

      <Button
        onClick={() => {
          window.location.reload()
        }}
      >
        Reload page
      </Button>
    </div>
  )
}
