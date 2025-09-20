import { Appearance, ColorOptions, TextStyle } from './appearance'
import { Dimension, Geometry, Position } from './geometry'
import { BaseWidgetOptions, UIState } from './widget'

function keysOf<T>() {
  return <K extends keyof T>(keys: K[]) => keys
}

type ExhaustiveCheck<U, A extends readonly any[]> = [U] extends [A[number]] // every U is in A
  ? [A[number]] extends [U] // every A element is in U
    ? true
    : never
  : never

export const POSITION_KEYS = keysOf<Position>()([
  'top',
  'right',
  'bottom',
  'left',
])

export const DIMENSION_KEYS = keysOf<Dimension>()(['width', 'height'])

export const COLOR_OPTIONS_KEYS = keysOf<ColorOptions>()([
  'color',
  'background',
])

export const TEXT_STYLE_KEYS = keysOf<TextStyle>()([
  'bold',
  'underline',
  'italic',
  'inverse',
  'textAlign',
])

export const UI_STATE_KEYS = [':focused', ':selected', ':disabled'] as const

const _ENSURE_UI_STATE_KEYS: ExhaustiveCheck<UIState, typeof UI_STATE_KEYS> =
  true

export const APPEARANCE_KEYS = keysOf<Appearance>()([
  ...COLOR_OPTIONS_KEYS,
  ...TEXT_STYLE_KEYS,
])

export const GEOMETRY_KEYS = keysOf<Geometry>()([
  ...POSITION_KEYS,
  ...DIMENSION_KEYS,
])

export const BASE_WIDGET_OPTIONS_KEYS = keysOf<BaseWidgetOptions>()([
  ...GEOMETRY_KEYS,
  ...APPEARANCE_KEYS,
])
