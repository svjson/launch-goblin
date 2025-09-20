import { resolveComponentStyle, Theme } from '@src/tui/framework/theme'
import { describe, it, expect } from 'vitest'

describe('resolveComponentStyle', () => {
  const SimpleTheme: Theme = {
    defaults: { color: 'white', background: 'black' },

    components: {
      Button: {
        color: 'black',
        background: '#888888',
        ':focused': {
          color: 'black',
          background: 'green',
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
        colorMode: {
          monochrome: {
            color: 'black',
            background: 'white',
          },
        },
      },
    },
  }

  it('should resolve default styles for non-overriden colorMode', () => {
    expect(resolveComponentStyle(SimpleTheme, 'Button', 'truecolor')).toEqual({
      color: 'black',
      background: '#888888',
      ':focused': {
        color: 'black',
        background: 'green',
      },
      ':disabled': {
        color: 'black',
        background: 'gray',
      },
    })
  })

  it('should resolve overriden styles for monochrome colorMode', () => {
    expect(resolveComponentStyle(SimpleTheme, 'Button', 'monochrome')).toEqual({
      color: 'black',
      background: 'white',
      ':focused': {
        color: 'white',
        background: 'black',
      },
      ':disabled': {
        color: 'white',
        background: 'black',
      },
    })
  })
})
