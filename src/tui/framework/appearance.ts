export type Color = number | string

export interface ColorOptions {
  color?: Color
  background?: Color
}

export interface TextStyle {
  bold?: boolean
  underline?: boolean
  italic?: boolean
  inverse?: boolean
}

export type Appearance = ColorOptions & TextStyle
