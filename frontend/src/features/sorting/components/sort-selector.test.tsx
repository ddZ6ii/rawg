import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GamesSortOrders } from '@rawg/shared'

import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { SortSelector } from './sort-selector'

function renderSortSelector(sortOrder: GamesSortOrders | null = null) {
  const onSelectSortOrder = vi.fn()
  const view = render(
    <SortSelector
      sortOrder={sortOrder}
      onSelectSortOrder={onSelectSortOrder}
    />,
    { wrapper: RenderWithProvider },
  )
  return { ...view, onSelectSortOrder }
}

describe('SortSelector', () => {
  it('shows "Relevance" by default when nothing is selected', async () => {
    renderSortSelector(null)

    expect(await screen.findByText('Relevance')).toBeInTheDocument()
  })

  it('shows the selected order label', async () => {
    renderSortSelector('name')

    expect(await screen.findByText('Name')).toBeInTheDocument()
  })

  it('calls onSelectSortOrder with the chosen order', async () => {
    const user = userEvent.setup()
    const { onSelectSortOrder } = renderSortSelector(null)

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Name' }))

    expect(onSelectSortOrder).toHaveBeenCalledWith('name')
  })

  it('calls onSelectSortOrder with null when "Relevance" is chosen', async () => {
    const user = userEvent.setup()
    const { onSelectSortOrder } = renderSortSelector('name')

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Relevance' }))

    expect(onSelectSortOrder).toHaveBeenCalledWith(null)
  })

  it('lists all ordering options', async () => {
    const user = userEvent.setup()
    renderSortSelector(null)

    await user.click(await screen.findByRole('combobox'))

    expect(
      screen.getByRole('option', { name: 'Relevance' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Date added' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Popularity' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Average rating' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Release date' }),
    ).toBeInTheDocument()
  })
})
