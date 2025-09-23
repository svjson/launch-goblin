export interface KeyMeta {
  sequence?: string
  name: string
  ctrl: boolean
  meta: false
  shift: false
  code?: string
  full: string
}

export interface KeyPress {
  ch?: string
  key: KeyMeta
}

export const KeyGen: Record<string, KeyPress> = {
  down: {
    ch: undefined,
    key: {
      sequence: '\\x1BOB',
      name: 'down',
      ctrl: false,
      meta: false,
      shift: false,
      code: 'OB',
      full: 'down',
    },
  },
  enter: {
    ch: '\r',
    key: {
      sequence: '\\r',
      name: 'enter',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'enter',
    },
  },
  return: {
    ch: '\r',
    key: {
      sequence: '\\r',
      name: 'return',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'return',
    },
  },
  tab: {
    ch: '\t',
    key: {
      sequence: '\\t',
      name: 'tab',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'tab',
    },
  },
  up: {
    ch: undefined,
    key: {
      sequence: '\\x1BOA',
      name: 'up',
      ctrl: false,
      meta: false,
      shift: false,
      code: 'OA',
      full: 'up',
    },
  },
}

export const genKeyPress = (keyName: string): [string | undefined, KeyMeta] => {
  const { ch, key } = KeyGen[keyName] ?? {}

  return [ch, key]
}
