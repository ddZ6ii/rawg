import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './app'

describe('app', () => {
  it('renders the nav bar with its logo', () => {
    const { container } = render(<App />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(container.querySelector('nav img')).toBeInTheDocument()
  })

  it('renders the aside and main regions', () => {
    render(<App />)

    expect(screen.getByText('Aside')).toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
  })
})
