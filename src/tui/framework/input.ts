export interface KeyMeta {
  sequence?: string
  name: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  code?: string
  full: string
}

export interface KeyPress {
  ch?: string
  key: KeyMeta
}
