import { describe, expect, it } from 'vitest'

import { PropertyPath } from '@whimbrel/walk'
import { createStore, matchesPath } from '@src/tui/framework/store'

interface TestProduct {
  id: number
  name: string
  sku: string
}

interface TestState {
  inventory: {
    stock: TestProduct[]
    backOrder: TestProduct[]
    ordered: TestProduct[]
  }
  config: {
    ui: {
      web: {
        fgColor: string
        bgColor: string
      }
      backOffice: {
        fgColor: string
        bgColor: string
      }
    }
  }
}

const makeTestState = (proto?: any): TestState => {
  return {
    inventory: {
      stock: [...(proto?.inventory?.stock ?? [])],
      backOrder: [...(proto?.inventory?.backOrder ?? [])],
      ordered: [...(proto?.inventory?.ordered ?? [])],
    },
    config: {
      ui: {
        web: {
          fgColor: 'black',
          bgColor: 'white',
          ...(proto?.config?.ui?.web ?? {}),
        },
        backOffice: {
          fgColor: 'white',
          bgColor: 'blue',
          ...(proto?.config?.ui?.backOffice ?? {}),
        },
      },
    },
  }
}

const makeTestSubscriber = <T>() => {
  const events: [PropertyPath, T][] = []
  return {
    events,
    handler: (p: PropertyPath, v: T) => {
      events.push([p, v])
      return true
    },
  }
}

const generateTests = <Inputs, Expected>(
  generator: (inputs: Inputs, expected: Expected) => void,
  expected: Expected,
  testCases: Inputs[]
) => {
  for (const testCase of testCases) {
    generator(testCase, expected)
  }
}

describe('matchesPath', () => {
  const matchesTest = (
    [testPath, againstPath]: [PropertyPath, PropertyPath],
    expected: boolean
  ) => {
    it(`should test ${expected} for ${testPath} against ${againstPath}`, () => {
      expect(matchesPath(testPath, againstPath)).toBe(expected)
    })
  }

  generateTests(matchesTest, true, [
    ['somewhere.over.the.rainbow', 'somewhere'],
    ['somewhere.over.the', 'somewhere'],
    ['somewhere.over', 'somewhere'],
    ['somewhere', 'somewhere'],
    [['somewhere', 'over', 'the', 'rainbow'], ['somewhere']],
    [['somewhere', 'over', 'the'], ['somewhere']],
    [['somewhere', 'over'], ['somewhere']],
    [['somewhere'], ['somewhere']],
  ])

  generateTests(matchesTest, false, [
    ['somewhere', 'somewhere.over.the.rainbow'],
    ['somewhere', 'somewhere.over.the'],
    ['somewhere', 'somewhere.over'],
    [['somewhere'], ['somewhere', 'over', 'the', 'rainbow']],
    [['somewhere'], ['somewhere', 'over', 'the']],
    [['somewhere'], ['somewhere', 'over']],
  ])
})

describe('Store', () => {
  describe('get', () => {
    it('should get values by period-delimited path', () => {
      // Given
      const state = makeTestState()
      const store = createStore(state)

      // Then
      expect(store.get('config.ui.web.fgColor')).toEqual('black')
      expect(store.get('config.ui.web')).toEqual({
        fgColor: 'black',
        bgColor: 'white',
      })
    })
  })

  describe('set', () => {
    it('should set values by period-delimited path', () => {
      // Given
      const state = makeTestState()
      const store = createStore(state)

      // When
      store.set('config.ui.web.fgColor', 'green')
      store.set('config.ui.backOffice', {
        fgColor: 'gray',
        bgColor: 'magenta',
      })

      // Then
      expect(state).toEqual(
        makeTestState({
          config: {
            ui: {
              web: {
                fgColor: 'green',
                bgColor: 'white',
              },
              backOffice: {
                fgColor: 'gray',
                bgColor: 'magenta',
              },
            },
          },
        })
      )
    })
  })

  describe('set/publish', () => {
    it('should publish events to subscribers at modified paths', () => {
      // Given
      const state = makeTestState()
      const store = createStore(state)

      const configSubscriber = makeTestSubscriber()
      const webFgSubscriber = makeTestSubscriber()

      store.subscribe('config', configSubscriber.handler)
      store.subscribe('config.ui.web.fgColor', webFgSubscriber.handler)

      // When
      store.set('config.ui.web.fgColor', 'green')
      store.set('config.ui.backOffice', {
        fgColor: 'gray',
        bgColor: 'magenta',
      })

      // Then
      expect(configSubscriber.events).toEqual([
        ['config.ui.web.fgColor', 'green'],
        [
          'config.ui.backOffice',
          {
            fgColor: 'gray',
            bgColor: 'magenta',
          },
        ],
      ])

      expect(webFgSubscriber.events).toEqual([
        ['config.ui.web.fgColor', 'green'],
      ])
    })
  })
})
