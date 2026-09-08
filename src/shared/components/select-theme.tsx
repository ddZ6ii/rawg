import { CogIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

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
import { useTheme } from '@/shared/hooks'
import { THEMES, type Theme } from '@/shared/schemas'
import { capitalize } from '@/shared/utilities'

const ICONS: Record<Theme, ReactNode> = {
  dark: <MoonIcon aria-hidden={true} />,
  light: <SunIcon aria-hidden={true} />,
  system: <CogIcon aria-hidden={true} />,
}

export function SelectTheme({ className }: { className?: string }) {
  const { theme, updateTheme } = useTheme()
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  return (
    <Select
      value={theme}
      onOpenChange={setIsSelectOpen}
      onValueChange={(nextValue) => {
        updateTheme(nextValue as Theme)
      }}
    >
      <WithTooltip
        tooltip={`Select Theme (${capitalize(theme)})`}
        open={isSelectOpen ? false : isTooltipOpen}
        onOpenChange={setIsTooltipOpen}
        className={className}
      >
        <>
          <SelectTrigger className="w-9 justify-center px-2 capitalize md:w-fit md:px-3 [&>svg:last-of-type]:hidden md:[&>svg:last-of-type]:block">
            <SelectValue className="hidden capitalize md:block">
              <>
                {ICONS[theme]}
                <span className="hidden capitalize md:block">{theme}</span>
              </>
            </SelectValue>
          </SelectTrigger>

          <SelectContent position="popper" align="end" className="capitalize">
            <SelectGroup>
              <SelectLabel>Theme</SelectLabel>
              {THEMES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </>
      </WithTooltip>
    </Select>
  )
}
