import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createGenre, createPlatform } from '@/tests/utilities'

import { useGameQuery } from './use-game-query'

const action = createGenre({ id: 4, name: 'Action' })
const rpg = createGenre({ id: 5, name: 'RPG' })
const pc = createPlatform({ id: 1, name: 'PC', slug: 'pc' })

describe('useGameQuery', () => {
  it('starts with an empty query', () => {
    const { result } = renderHook(() => useGameQuery())

    expect(result.current.gameQuery).toEqual({
      genre: null,
      platform: null,
      search: null,
      ordering: null,
    })
    expect(result.current.deferredGameQuery).toBe(result.current.gameQuery)
    expect(result.current.isPending).toBe(false)
  })

  describe('selectGenre', () => {
    it('selects a genre', () => {
      const { result } = renderHook(() => useGameQuery())

      act(() => {
        result.current.selectGenre(action)
      })

      expect(result.current.gameQuery.genre).toBe(action)
    })

    it('switches to another genre', () => {
      const { result } = renderHook(() => useGameQuery())

      act(() => {
        result.current.selectGenre(action)
      })
      act(() => {
        result.current.selectGenre(rpg)
      })

      expect(result.current.gameQuery.genre).toBe(rpg)
    })

    it('clears the genre when the selected one is chosen again', () => {
      const { result } = renderHook(() => useGameQuery())

      act(() => {
        result.current.selectGenre(action)
      })
      act(() => {
        result.current.selectGenre({ ...action })
      })

      expect(result.current.gameQuery.genre).toBeNull()
    })
  })

  it('sets the platform', () => {
    const { result } = renderHook(() => useGameQuery())

    act(() => {
      result.current.selectPlatform(pc)
    })
    expect(result.current.gameQuery.platform).toBe(pc)

    act(() => {
      result.current.selectPlatform(null)
    })
    expect(result.current.gameQuery.platform).toBeNull()
  })

  it('sets the sort order', () => {
    const { result } = renderHook(() => useGameQuery())

    act(() => {
      result.current.selectSortOrder('-released')
    })
    expect(result.current.gameQuery.ordering).toBe('-released')

    act(() => {
      result.current.selectSortOrder(null)
    })
    expect(result.current.gameQuery.ordering).toBeNull()
  })

  it('sets the search', () => {
    const { result } = renderHook(() => useGameQuery())

    act(() => {
      result.current.setSearch('zelda')
    })
    expect(result.current.gameQuery.search).toBe('zelda')

    act(() => {
      result.current.setSearch(null)
    })
    expect(result.current.gameQuery.search).toBeNull()
  })

  it('keeps the other filters when one changes', () => {
    const { result } = renderHook(() => useGameQuery())

    act(() => {
      result.current.selectGenre(action)
      result.current.selectPlatform(pc)
      result.current.selectSortOrder('name')
      result.current.setSearch('zelda')
    })

    expect(result.current.gameQuery).toEqual({
      genre: action,
      platform: pc,
      search: 'zelda',
      ordering: 'name',
    })
  })

  it('keeps the same query when a setter repeats the current value', () => {
    const { result } = renderHook(() => useGameQuery())

    act(() => {
      result.current.selectPlatform(pc)
      result.current.selectSortOrder('name')
      result.current.setSearch('zelda')
    })
    const before = result.current.gameQuery

    act(() => {
      result.current.selectPlatform({ ...pc })
      result.current.selectSortOrder('name')
      result.current.setSearch('zelda')
    })

    expect(result.current.gameQuery).toBe(before)
  })

  it('returns stable setters across renders', () => {
    const { result } = renderHook(() => useGameQuery())
    const first = result.current

    act(() => {
      result.current.setSearch('zelda')
    })

    expect(result.current.selectGenre).toBe(first.selectGenre)
    expect(result.current.selectPlatform).toBe(first.selectPlatform)
    expect(result.current.selectSortOrder).toBe(first.selectSortOrder)
    expect(result.current.setSearch).toBe(first.setSearch)
  })

  it('is pending until the deferred query catches up', () => {
    // Record every render: React first renders with the previous deferred
    // value, then re-renders in the background with the new one.
    const renders: ReturnType<typeof useGameQuery>[] = []
    const { result } = renderHook(() => {
      const value = useGameQuery()
      renders.push(value)
      return value
    })
    renders.length = 0

    act(() => {
      result.current.setSearch('zelda')
    })

    const [urgent] = renders
    expect(urgent?.gameQuery.search).toBe('zelda')
    expect(urgent?.deferredGameQuery.search).toBeNull()
    expect(urgent?.isPending).toBe(true)

    expect(result.current.deferredGameQuery).toBe(result.current.gameQuery)
    expect(result.current.isPending).toBe(false)
  })
})
