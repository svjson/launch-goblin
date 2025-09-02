import { withSign } from '@src/tui/framework/layout'
import { describe, expect, it } from 'vitest'

describe('withSign', () => {
  it.each([
    [0, '+0'],
    [1, '+1'],
    [-1, '-1'],
  ])("should format %d as '%s'", (input, expected) => {
    expect(withSign(input)).toEqual(expected)
  })
})
