import { BsGlobe, BsNintendoSwitch } from 'react-icons/bs'
import {
  FaAndroid,
  FaApple,
  FaLinux,
  FaPlaystation,
  FaWindows,
  FaXbox,
} from 'react-icons/fa'
import type { IconType } from 'react-icons/lib'
import { MdPhoneIphone, MdSmartphone } from 'react-icons/md'

import type { Platform } from '@rawg/shared'

import { WithTooltip } from '@/shared'

const ICON_MAP: Record<string, IconType> = {
  android: FaAndroid,
  linux: FaLinux,
  ios: MdPhoneIphone,
  mac: FaApple,
  mobile: MdSmartphone,
  nintendo: BsNintendoSwitch,
  pc: FaWindows,
  playstation: FaPlaystation,
  web: BsGlobe,
  xbox: FaXbox,
}

export function PlatformIconList({ platforms }: { platforms: Platform[] }) {
  return (
    <ul className="text-muted-foreground flex flex-wrap items-center gap-2">
      {platforms.map((platform) => {
        const Icon = ICON_MAP[platform.slug]
        if (!Icon) return null
        return (
          <li key={platform.id}>
            <WithTooltip tooltip={platform.name} className="block">
              <Icon className="size-5" />
            </WithTooltip>
          </li>
        )
      })}
    </ul>
  )
}
