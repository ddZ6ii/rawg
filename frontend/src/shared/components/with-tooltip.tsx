import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'

type WithTooltipProps = React.ComponentProps<typeof Tooltip> &
  Pick<React.ComponentProps<typeof TooltipContent>, 'side'> & {
    tooltip: React.ReactNode
    className?: string
  }

export function WithTooltip({
  children,
  className,
  tooltip,
  side = 'top',
  ...props
}: WithTooltipProps) {
  if (!tooltip) {
    return <>{children}</>
  }

  return (
    <Tooltip disableHoverableContent delayDuration={300} {...props}>
      <TooltipTrigger asChild>
        <span
          role="presentation"
          className={cn('inline-block w-fit', className)}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
