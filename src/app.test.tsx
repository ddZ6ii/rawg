import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './app'

describe('app', () => {
  it('renders the layout regions', () => {
    render(<App />)

    expect(screen.getByText('Navbar')).toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
  })
})
