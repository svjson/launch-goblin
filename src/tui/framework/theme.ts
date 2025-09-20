import { mergeLeft } from '@whimbrel/walk'

import { Appearance, ColorOptions, TextStyle } from './appearance'
import { ColorMode } from './environment'
import { APPEARANCE_KEYS, UI_STATE_KEYS } from './options'
import { narrow, UIState } from './widget'

export type BaseComponentThemeStyle = ColorOptions & TextStyle

export type ColorModeVariants = {
  colorMode?: Partial<Record<ColorMode, BaseComponentThemeStyle>>
}

export type StateVariants = Partial<
  Record<UIState, BaseComponentThemeStyle & ColorModeVariants>
>

export type ComponentThemeStyle = BaseComponentThemeStyle &
  StateVariants &
  ColorModeVariants

export interface Theme {
  defaults: Appearance
  components: Record<string, ComponentThemeStyle>
}

export const resolveComponentStyle = (
  theme: Theme,
  component: string,
  colorMode: ColorMode,
  cmpDefaults?: ComponentThemeStyle
): BaseComponentThemeStyle & StateVariants => {
  const componentThemeStyle = theme.components[component] ?? {}

  const cmpStyle = mergeLeft(
    {},
    narrow(componentThemeStyle, APPEARANCE_KEYS),
    narrow(componentThemeStyle.colorMode?.[colorMode] ?? {}, APPEARANCE_KEYS)
  )

  for (const variant of UI_STATE_KEYS) {
    if (Object.hasOwn(componentThemeStyle, variant)) {
      cmpStyle[variant] = mergeLeft(
        {},
        narrow(componentThemeStyle[variant] ?? {}, APPEARANCE_KEYS),
        narrow(
          componentThemeStyle[variant]?.colorMode?.[colorMode] ?? {},
          APPEARANCE_KEYS
        )
      )
    }
  }

  return cmpStyle
}

export const DefaultTheme: Theme = {
  defaults: { color: 'white', background: 'black' },

  components: {
    Button: {
      color: 'black',
      background: '#888888',
      ':focused': {
        color: 'black',
        background: 'green',
        underline: true,
        colorMode: {
          monochrome: {
            color: 'white',
            background: 'black',
          },
        },
      },
      ':disabled': {
        color: 'black',
        background: 'gray',
        colorMode: {
          monochrome: {
            color: 'white',
            background: 'black',
          },
        },
      },
    },
    CheckBox: {
      color: 'gray',
      colorMode: {
        monochrome: {
          color: 'white',
        },
      },
      ':selected': {
        color: 'white',
      },
      ':focused': {
        background: 'blue',
        colorMode: {
          monochrome: {
            background: 'white',
            color: 'black',
          },
        },
      },
    },
    ListBox: {
      ':selected': {
        background: 'white',
        color: 'black',
        bold: true,
      },
      ':focused': {
        background: 'blue',
        color: 'white',
      },
    },
    Option: {
      background: 'default',
      color: 'white',
      ':focused': {
        background: 'blue',
      },
      ':selected': {
        color: 'black',
        background: 'white',
      },
    },
    TextInput: {
      background: '#888888',
      color: 'white',
      ':focused': {
        background: 'blue',
      },
    },
  },
}
