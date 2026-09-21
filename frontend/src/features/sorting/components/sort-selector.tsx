import { memo, useId } from 'react'

import type { GamesSortOrders } from '@rawg/shared'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared'

const DEFAULT_SELECTION = {
  value: 'default',
  label: 'Relevance',
} as const

const ORDER_OPTIONS = [
  { ...DEFAULT_SELECTION },
  { value: '-added', label: 'Date added' },
  { value: '-metacritic', label: 'Popularity' },
  { value: 'name', label: 'Name' },
  { value: '-rating', label: 'Average rating' },
  { value: '-released', label: 'Release date' },
] as const satisfies readonly {
  value: GamesSortOrders | typeof DEFAULT_SELECTION.value
  label: string
}[]

function getOption(sortOrder: GamesSortOrders | null) {
  return (
    ORDER_OPTIONS.find((option) => option.value === sortOrder) ??
    DEFAULT_SELECTION
  )
}

const SortSelector = memo(function SortSelector({
  sortOrder,
  onSelectSortOrder,
}: {
  sortOrder: GamesSortOrders | null
  onSelectSortOrder: (nextSortBy: GamesSortOrders | null) => void
}) {
  const triggerId = useId()

  return (
    <div className="flex flex-col items-start gap-0.5">
      <label
        htmlFor={triggerId}
        className="text-muted-foreground text-xs whitespace-nowrap"
      >
        Order by:
      </label>

      <Select
        value={getOption(sortOrder).value}
        onValueChange={(nextValue) => {
          const nextOrderBy =
            nextValue === DEFAULT_SELECTION.value
              ? null
              : (nextValue as GamesSortOrders)
          onSelectSortOrder(nextOrderBy)
        }}
      >
        <SelectTrigger
          id={triggerId}
          className="min-w-36 justify-between px-2 capitalize [&>svg:last-of-type]:hidden md:[&>svg:last-of-type]:block"
        >
          <SelectValue className="hidden capitalize md:block">
            {getOption(sortOrder).label}
          </SelectValue>
        </SelectTrigger>

        <SelectContent position="popper" align="end" className="capitalize">
          <SelectGroup>
            <SelectLabel>Ordering options</SelectLabel>
            {ORDER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
})

export { SortSelector }
