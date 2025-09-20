import { APPEARANCE_KEYS } from '@src/tui/framework/options'
import { ComponentThemeStyle } from '@src/tui/framework/theme'
import { narrow } from '@src/tui/framework/widget'
import { describe, expect, it } from 'vitest'

describe('narrow', () => {
  it('should trim all non-appearance keys from object', () => {
    expect(
      narrow(
        {
          color: 'black',
          background: 'red',
          colorMode: {
            monochrome: {
              color: 'white',
              background: 'black',
            },
          },
        } as ComponentThemeStyle,
        APPEARANCE_KEYS
      )
    ).toEqual({
      color: 'black',
      background: 'red',
    })
  })
})
