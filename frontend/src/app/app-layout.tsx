import { cn } from '@/shared'

// Layout tokens: every sticky offset and gutter below derives from these
const LAYOUT_VARS =
  '[--header-h:--spacing(16)] [--gutter:--spacing(2)] lg:[--gutter:--spacing(4)]'

/**
 * Root of the page. The page is the scroll container: header, sidebar and
 * toolbar are sticky so the wheel scrolls the content from anywhere.
 */
function AppLayout({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex min-h-dvh flex-col', LAYOUT_VARS, className)}
      {...props}
    />
  )
}

/** Sticky top bar; place inside `AppLayout`. */
function AppHeader({
  className,
  children,
  ...props
}: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn(
        'bg-background sticky top-0 z-20 h-(--header-h)',
        className,
      )}
      {...props}
    >
      <div className="container mx-auto flex h-full items-center justify-between gap-3 px-(--gutter)">
        {children}
      </div>
    </header>
  )
}

/** Grid below the header holding `AppSidebar` and `AppMain`. */
function AppBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'container mx-auto grid flex-1 gap-x-(--gutter) px-(--gutter) pb-(--gutter) lg:grid-cols-[220px_4fr]',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Sticky side column; place inside `AppBody`. Scrolls on its own when its
 * content is taller than the viewport.
 */
function AppSidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'sticky top-(--header-h) max-h-[calc(100dvh-var(--header-h))] self-start overflow-y-auto',
        className,
      )}
      {...props}
    />
  )
}

/** Main column; place inside `AppBody`, holds `AppToolbar` and the content. */
function AppMain({ className, ...props }: React.ComponentProps<'main'>) {
  return <main className={cn('flex min-w-0 flex-col', className)} {...props} />
}

/**
 * Sticky band under the header; place inside `AppMain`. Bleeds one gutter
 * each side so content shadows can't show beside it.
 */
function AppToolbar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-background sticky top-(--header-h) z-10 -mx-(--gutter) flex flex-col gap-(--gutter) px-(--gutter) pb-(--gutter)',
        className,
      )}
      {...props}
    />
  )
}

export { AppBody, AppHeader, AppLayout, AppMain, AppSidebar, AppToolbar }
