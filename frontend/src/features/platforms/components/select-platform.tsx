import { useSuspenseQuery } from '@tanstack/react-query'
import { memo, useId } from 'react'

import type { Platform } from '@rawg/shared'

import { createPlatformsQueryOptions } from '@/features/platforms/services'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared'

const NO_SELECTION = 'All Platforms'
const NO_SELECTION_VALUE = 'all'

const SelectPlatform = memo(function SelectPlatform({
  selectedPlatform,
  onSelectPlatform,
}: {
  selectedPlatform: Platform | null
  onSelectPlatform: (platform: Platform | null) => void
}) {
  const triggerId = useId()
  const { data: platforms } = useSuspenseQuery(
    createPlatformsQueryOptions({ options: { ordering: 'name' } }),
  )

  if (platforms.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      <label
        htmlFor={triggerId}
        className="text-muted-foreground text-xs whitespace-nowrap"
      >
        Platform:
      </label>

      <Select
        value={
          selectedPlatform ? String(selectedPlatform.id) : NO_SELECTION_VALUE
        }
        onValueChange={(nextValue) => {
          const nextPlatform =
            nextValue === NO_SELECTION_VALUE
              ? null
              : platforms.find((platform) => nextValue === String(platform.id))
          if (nextPlatform === undefined) {
            throw new Error(`Platform with value ${nextValue} not found`)
          }
          onSelectPlatform(nextPlatform)
        }}
      >
        <SelectTrigger
          id={triggerId}
          className="min-w-48 justify-between px-2 capitalize md:w-fit md:px-3 [&>svg:last-of-type]:hidden md:[&>svg:last-of-type]:block"
        >
          <SelectValue className="hidden capitalize md:block">
            {selectedPlatform?.name ?? NO_SELECTION}
          </SelectValue>
        </SelectTrigger>

        <SelectContent position="popper" align="end" className="capitalize">
          <SelectGroup>
            <SelectLabel>Platforms</SelectLabel>
            {selectedPlatform !== null && (
              <SelectItem value={NO_SELECTION_VALUE} className="border-b">
                {NO_SELECTION}
              </SelectItem>
            )}
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={String(platform.id)}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
})

function SelectPlatformSkeleton() {
  const triggerId = useId()

  return (
    <div className="flex flex-col items-start gap-0.5">
      <label
        htmlFor={triggerId}
        className="text-muted-foreground text-xs whitespace-nowrap"
      >
        Platform:
      </label>
      <Select defaultValue="Loading platforms..." disabled>
        <SelectTrigger
          id={triggerId}
          className="min-w-48 justify-between px-2 md:w-fit md:px-3 [&>svg:last-of-type]:hidden md:[&>svg:last-of-type]:block"
        >
          <div className="flex items-center gap-2">
            <SelectValue className="hidden md:block">Loading...</SelectValue>
            <Spinner className="size-4" />
          </div>
        </SelectTrigger>
      </Select>
    </div>
  )
}

export { SelectPlatform, SelectPlatformSkeleton }
