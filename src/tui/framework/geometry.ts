export type Pos = number | string

export type Size = number | string

export interface Position {
  top?: Pos
  right?: Pos
  bottom?: Pos
  left?: Pos
}

export interface Dimension {
  width?: Size
  height?: Size
}

export interface Spacing {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface AxisSpacing {
  horizontal: number
  vertical: number
}

export interface BoxSpacing {
  margin?: Spacing
  padding?: Spacing
}

export type Geometry = Position & Dimension & BoxSpacing
