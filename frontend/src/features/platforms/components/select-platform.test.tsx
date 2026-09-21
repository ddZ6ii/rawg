import { queryOptions } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Platform } from '@rawg/shared'

import { createPlatformsQueryOptions } from '@/features/platforms/services'
import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { SelectPlatform } from './select-platform'

vi.mock('@/features/platforms/services', () => ({
  createPlatformsQueryOptions: vi.fn(),
}))

const pc: Platform = { id: 1, name: 'PC', slug: 'pc' }
const playstation: Platform = {
  id: 2,
  name: 'PlayStation',
  slug: 'playstation',
}

function mockPlatforms(platforms: Platform[]) {
  vi.mocked(createPlatformsQueryOptions).mockReturnValue(
    queryOptions({
      queryKey: ['platforms', 'test'],
      queryFn: () => Promise.resolve(platforms),
    }) as unknown as ReturnType<typeof createPlatformsQueryOptions>,
  )
}

function renderSelectPlatform(selectedPlatform: Platform | null = null) {
  const onSelectPlatform = vi.fn()
  const view = render(
    <SelectPlatform
      selectedPlatform={selectedPlatform}
      onSelectPlatform={onSelectPlatform}
    />,
    { wrapper: RenderWithProvider },
  )
  return { ...view, onSelectPlatform }
}

describe('SelectPlatform', () => {
  it('shows "All Platforms" by default when nothing is selected', async () => {
    mockPlatforms([pc, playstation])
    renderSelectPlatform(null)

    expect(await screen.findByText('All Platforms')).toBeInTheDocument()
  })

  it('shows the selected platform name', async () => {
    mockPlatforms([pc, playstation])
    renderSelectPlatform(pc)

    expect(await screen.findByText('PC')).toBeInTheDocument()
  })

  it('calls onSelectPlatform with the chosen platform', async () => {
    mockPlatforms([pc, playstation])
    const user = userEvent.setup()
    const { onSelectPlatform } = renderSelectPlatform(null)

    await user.click(await screen.findByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'PlayStation' }))

    expect(onSelectPlatform).toHaveBeenCalledWith(playstation)
  })

  it('clears the selection when "All Platforms" is chosen', async () => {
    mockPlatforms([pc, playstation])
    const user = userEvent.setup()
    const { onSelectPlatform } = renderSelectPlatform(pc)

    await user.click(await screen.findByRole('combobox'))
    await user.click(
      await screen.findByRole('option', { name: 'All Platforms' }),
    )

    expect(onSelectPlatform).toHaveBeenCalledWith(null)
  })

  it('does not offer "All Platforms" as an option when nothing is selected', async () => {
    mockPlatforms([pc, playstation])
    const user = userEvent.setup()
    renderSelectPlatform(null)

    await user.click(await screen.findByRole('combobox'))

    expect(
      screen.queryByRole('option', { name: 'All Platforms' }),
    ).not.toBeInTheDocument()
  })

  it('renders nothing when there are no platforms', async () => {
    mockPlatforms([])
    const { container } = renderSelectPlatform(null)

    await vi.waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })
})
