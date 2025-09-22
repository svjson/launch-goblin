import { Action, Application, ApplicationController } from '@src/tui/framework'
import { describe, it, expect } from 'vitest'
import { applicationEnvironment } from './fixtures'

describe('Application', () => {
  describe('subclassing', () => {
    it('should merge subclass actions declaration with child', () => {
      // Given
      class MyApp extends Application<any, ApplicationController<any>> {
        actions = this.defineActions({
          'ponder-consequence': this.ponderConsequence,
        })

        ponderConsequence(_action: Action) {
          console.log('Consequences - how do they work?')
        }
      }

      // When
      const myApp = new MyApp(
        applicationEnvironment(),
        ApplicationController<any>,
        {}
      )

      // Then
      expect(myApp.actions).toEqual({
        'ponder-consequence': expect.any(Function),
        'open-modal': expect.any(Function),
      })
    })
  })
})
