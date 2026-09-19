import { useRef, useState } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { useIsTruncated } from '@/shared/hooks'

/**
 * Wraps a single truncated element and shows a tooltip with its full
 * content, but only when the element is actually truncated.
 */
export function TruncatedTooltip({
  children,
  tooltip,
}: React.PropsWithChildren & {
  tooltip: React.ReactNode
}) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const isTruncated = useIsTruncated(ref)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Tooltip open={isTruncated && isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger ref={ref} asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
