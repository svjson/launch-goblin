import { Appearance, ColorOptions, TextStyle } from './appearance'
import { Dimension, Geometry, Position } from './geometry'
import { BaseWidgetOptions } from './widget'

function keysOf<T>() {
  return <K extends keyof T>(keys: K[]) => keys
}
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
])

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
