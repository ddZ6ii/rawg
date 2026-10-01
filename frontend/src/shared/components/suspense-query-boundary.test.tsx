import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SuspenseQueryBoundary } from './suspense-query-boundary'

function Child({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <p>content</p>
}

function renderBoundary(shouldThrow: boolean, resetKey: string) {
  return (
    <SuspenseQueryBoundary
      fallback={() => <p>error</p>}
      loadingFallback={<p>loading</p>}
      resetKeys={[resetKey]}
    >
      <Child shouldThrow={shouldThrow} />
    </SuspenseQueryBoundary>
  )
}

describe('SuspenseQueryBoundary', () => {
  // React logs caught render errors; silence them to keep test output clean
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(vi.fn())
  })

  it('renders the fallback when a child throws', () => {
    render(renderBoundary(true, 'a'))

    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('recovers from an error when a reset key changes', () => {
    const { rerender } = render(renderBoundary(true, 'a'))

    rerender(renderBoundary(false, 'b'))

    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('stays in the error state while reset keys are unchanged', () => {
    const { rerender } = render(renderBoundary(true, 'a'))

    rerender(renderBoundary(false, 'a'))

    expect(screen.getByText('error')).toBeInTheDocument()
  })
})
