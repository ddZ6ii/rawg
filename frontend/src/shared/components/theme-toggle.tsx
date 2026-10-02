import { MoonIcon, SunIcon } from 'lucide-react'
import { useId } from 'react'

import { useTheme } from '@/shared/hooks'
import { cn } from '@/shared/lib'

import { Label, Switch } from './ui'

export function ThemeToggle({ className }: { className?: string }) {
  const id = useId()
  const { theme, updateTheme } = useTheme()

  const isDarkMode = theme === 'dark'
  const Icon = isDarkMode ? MoonIcon : SunIcon

  const handleThemeChange = (checked: boolean) => {
    updateTheme(checked ? 'dark' : 'light')
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Switch
        id={id}
        checked={isDarkMode}
        onCheckedChange={handleThemeChange}
        thumbChildren={
          <Icon aria-hidden className="text-switch-thumb-foreground size-3" />
        }
      />

      <Label htmlFor={id} className="min-h-11 cursor-pointer">
        Dark mode
      </Label>
    </div>
  )
}
