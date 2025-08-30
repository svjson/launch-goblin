import { withSign } from '@src/tui/framework/layout'
import { generateTests } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('withSign', () => {
  const makeSignTest = ([input, expected]: [
    input: number,
    expected: string,
  ]) => {
    it(`should format ${input} as '${expected}`, () => {
      expect(withSign(input)).toEqual(expected)
    })
  }

  generateTests(makeSignTest, [
    [0, '+0'],
    [1, '+1'],
    [-1, '-1'],
  ])
})
