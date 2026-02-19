import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the RAWG heading', () => {
    render(<App />)

    const heading = screen.getByRole('heading', { name: /RAWG/i })

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('RAWG')
  })
})
