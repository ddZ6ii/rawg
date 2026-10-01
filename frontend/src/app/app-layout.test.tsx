import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ThemeContextProvider } from '@/shared'
import { RenderWithProvider } from '@/tests/utilities'

import { AppHeader, AppToolbar } from './app-layout'

describe('AppHeader', () => {
  it('renders the navigation and the theme selector', () => {
    render(
      <ThemeContextProvider>
        <AppHeader />
      </ThemeContextProvider>,
      { wrapper: RenderWithProvider },
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
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
