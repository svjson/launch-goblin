import { Controller } from '@src/tui/framework'
import { describe, expect, it } from 'vitest'
import { applicationEnvironment } from './fixtures'

describe('Controller', () => {
  describe('defineEvents', () => {
    it('should produce an eventMap of event names to functions bound to instance', () => {
      // Given
      class MyCtrl extends Controller {
        focusCalled: boolean = false
        textChangedCalled: boolean = false

        events = this.defineEvents({
          focus: () => (this.focusCalled = true),
          'text-changed': () => (this.textChangedCalled = true),
        })
      }
      const appEnv = applicationEnvironment()

      // When
      const instance = new MyCtrl(appEnv, appEnv.backend.createBox({}), {})

      // Then
      expect(instance.events).toEqual({
        focus: expect.any(Function),
        'text-changed': expect.any(Function),
      })
      expect(instance.focusCalled).toBe(false)
      expect(instance.textChangedCalled).toBe(false)

      // When
      instance.events.focus()

      // Then
      expect(instance.focusCalled).toBe(true)
      expect(instance.textChangedCalled).toBe(false)

      // When
      instance.events['text-changed']()

      // Then
      expect(instance.focusCalled).toBe(true)
      expect(instance.textChangedCalled).toBe(true)
    })

    it('should produce a flat eventMap of event names, prefixed to component name, when applicable to functions bound to instance', () => {
      // Given
      class MyCtrl extends Controller {
        focusCalled: boolean = false
        textChangedCalled: boolean = false

        events = this.defineEvents({
          focus: () => (this.focusCalled = true),
          textField: {
            'text-changed': () => (this.textChangedCalled = true),
          },
        })
      }
      const appEnv = applicationEnvironment()

      // When
      const instance = new MyCtrl(appEnv, appEnv.backend.createBox({}), {})

      // Then
      expect(instance.events).toEqual({
        focus: expect.any(Function),
        'textField:text-changed': expect.any(Function),
      })
      expect(instance.focusCalled).toBe(false)
      expect(instance.textChangedCalled).toBe(false)

      // When
      instance.events.focus()

      // Then
      expect(instance.focusCalled).toBe(true)
      expect(instance.textChangedCalled).toBe(false)

      // When
      instance.events['textField:text-changed']()

      // Then
      expect(instance.focusCalled).toBe(true)
      expect(instance.textChangedCalled).toBe(true)
    })
  })
})
