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

  textAlign?: 'left' | 'center' | 'right'
}

export type BorderType = 'none' | 'line'

export interface BorderOptions {
  type: BorderType
  color?: Color
  background?: Color
  label?: string
}

export interface Border {
  border?: BorderOptions | 'none'
}

export type Appearance = ColorOptions & TextStyle
