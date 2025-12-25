import { describe, expect, it } from 'vitest'
import { runGoblinApp } from 'test/fixtures'

describe('LaunchGoblinApp', () => {
  describe('Initial state', () => {
    it('should start with component section focused', async () => {
      const { adapter } = await runGoblinApp({
        projectId: 'dummy-project',
      })

      await adapter.keyPress('tab')

      expect(adapter.getFocusedWidget()).toBeDefined()
    })
  })

  describe('Global keys', () => {
    it.each([
      ['ComponentSection', { tabStop: 0 }],
      ['ConfigSection', { tabStop: 2 }],
      ['Button', { tabStop: 1 }],
    ])(
      'should trigger launch on C-l when %s is focused',
      async (_origin: string, opts: { tabStop: number }) => {
        // Given
        const { adapter } = await runGoblinApp({
          projectId: 'dummy-project',
        })
        // ...focused component according to case
        for (let i = 0; i < opts.tabStop; i++) {
          await adapter.keyPress('tab')
        }
        expect(adapter.applicationEvents).toEqual([])

        // When
        await adapter.keyPress('C-l')

        // Then
        expect(adapter.applicationEvents).toEqual(['launch'])
      }
    )
  })
})
