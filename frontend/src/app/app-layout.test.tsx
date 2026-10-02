import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppHeader, AppToolbar } from './app-layout'

describe('AppHeader', () => {
  it('renders its children inside a banner', () => {
    render(
      <AppHeader>
        <span>content</span>
      </AppHeader>,
    )
    expect(screen.getByRole('banner')).toHaveTextContent('content')
  })
})

describe('layout parts', () => {
  it('forward className and props to their element', () => {
    render(
      <AppToolbar className="extra" data-testid="toolbar">
        content
      </AppToolbar>,
    )

    const toolbar = screen.getByTestId('toolbar')
    expect(toolbar).toHaveClass('sticky', 'extra')
    expect(toolbar).toHaveTextContent('content')
  })
})
