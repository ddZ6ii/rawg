import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

import { TooltipProvider } from '@/shared/components/ui/tooltip'

export function RenderWithProvider({ children }: React.PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Suspense fallback={null}>{children}</Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
