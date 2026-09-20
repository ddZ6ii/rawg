import { useSuspenseQuery } from '@tanstack/react-query'
import { memo, useId, useState } from 'react'

import type { Platform } from '@rawg/shared'

import { createPlatformsQueryOptions } from '@/features/platforms/services'
import { WithTooltip } from '@/shared/components'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { capitalize } from '@/shared/utilities'

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
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const { data: platforms } = useSuspenseQuery(
    createPlatformsQueryOptions({ options: { ordering: 'name' } }),
  )

  if (platforms.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={triggerId}
        className="text-muted-foreground whitespace-nowrap"
      >
        Select a platform:
      </label>

      <Select
        value={
          selectedPlatform ? String(selectedPlatform.id) : NO_SELECTION_VALUE
        }
        onOpenChange={setIsSelectOpen}
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
        <WithTooltip
          tooltip={`Current selection: ${capitalize(selectedPlatform?.name ?? 'All Platforms')}`}
          open={isSelectOpen ? false : isTooltipOpen}
          onOpenChange={setIsTooltipOpen}
        >
          <>
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
          </>
        </WithTooltip>
      </Select>
    </div>
  )
})

function SelectPlatformSkeleton() {
  return (
    <Select defaultValue="Loading platforms..." disabled>
      <SelectTrigger className="min-w-48 justify-between px-2 md:w-fit md:px-3 [&>svg:last-of-type]:hidden md:[&>svg:last-of-type]:block">
        <div className="flex items-center gap-2">
          <Spinner className="size-4" />
          <SelectValue className="hidden md:block">
            Loading platforms...
          </SelectValue>
        </div>
      </SelectTrigger>
    </Select>
  )
}

export { SelectPlatform, SelectPlatformSkeleton }
