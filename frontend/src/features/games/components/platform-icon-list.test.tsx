import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Platform } from '@rawg/shared'

import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { PlatformIconList } from './platform-icon-list'

const pc: Platform = { id: 1, name: 'PC', slug: 'pc' }
const playstation: Platform = {
  id: 2,
  name: 'PlayStation',
  slug: 'playstation',
}
const unknown: Platform = { id: 3, name: 'Commodore 64', slug: 'commodore-64' }

describe('PlatformIconList', () => {
  it('renders an icon for each known platform', () => {
    render(<PlatformIconList platforms={[pc, playstation]} />, {
      wrapper: RenderWithProvider,
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('skips platforms with no matching icon', () => {
    render(<PlatformIconList platforms={[pc, unknown]} />, {
      wrapper: RenderWithProvider,
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('shows the platform name in a tooltip on hover', async () => {
    const user = userEvent.setup()
    render(<PlatformIconList platforms={[pc]} />, {
      wrapper: RenderWithProvider,
    })

    await user.hover(screen.getByRole('presentation'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('PC')
  })
})
