import { KeyPress, KeyMeta } from '../input'

const CHAR_0 = 48
const CHAR_UCASE_A = 65
const CHAR_LCASE_A = 97

export const KeyGen: Record<string, KeyPress> = {
  ' ': {
    ch: ' ',
    key: {
      sequence: ' ',
      name: ' ',
      ctrl: false,
      meta: false,
      shift: false,
      full: ' ',
    },
  },
  delete: {
    ch: undefined,
    key: {
      sequence: '\\x1B[3~',
      name: 'delete',
      ctrl: false,
      meta: false,
      shift: false,
      code: '[3~',
      full: 'delete',
    },
  },
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
  left: {
    ch: undefined,
    key: {
      sequence: '\\x1BOD',
      name: 'left',
      ctrl: false,
      meta: false,
      shift: false,
      code: 'OD',
      full: 'left',
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
  right: {
    ch: undefined,
    key: {
      sequence: '\\x1BOC',
      name: 'right',
      ctrl: false,
      meta: false,
      shift: false,
      code: 'OC',
      full: 'right',
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
  ...[...Array(10)]
    .map((_, i) => String.fromCharCode(CHAR_0 + i))
    .concat([...Array(26)].map((_, i) => String.fromCharCode(CHAR_UCASE_A + i)))
    .concat([...Array(26)].map((_, i) => String.fromCharCode(CHAR_LCASE_A + i)))
    .reduce(
      (keys, ch) => ({
        ...keys,
        [ch]: {
          ch,
          key: {
            sequence: ch,
            name: ch,
            ctrl: false,
            meta: false,
            shift: false,
            full: ch,
          },
        },
      }),
      {}
    ),
}

const MOD_REGEX = /^(?<modifiers>(?:[CMS]-)+)(?<keySym>.+)$/

const applyModifiers = (
  full: string,
  keySym: string,
  modifiers: string
): KeyPress => {
  const { key } = KeyGen[keySym]
  return {
    ch: undefined,
    key: {
      ...key,
      ctrl: modifiers === 'C',
      shift: modifiers === 'S',
      meta: modifiers === 'M',
      full,
    },
  }
}

export const genKeyPress = (keyName: string): [string | undefined, KeyMeta] => {
  const match = MOD_REGEX.exec(keyName)

  const { ch, key } = match?.groups
    ? applyModifiers(keyName, match.groups.keySym, match.groups.modifiers)
    : (KeyGen[keyName] ?? {})

  return [ch, key]
}
