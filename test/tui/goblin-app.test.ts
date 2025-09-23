import { describe, expect, it } from 'vitest'
import { HeadlessBackend } from '@src/tui/framework'
import { runGoblinApp } from 'test/fixtures'

describe('LaunchGoblinApp', () => {
  it('should start with component section focused', async () => {
    const { app, env } = runGoblinApp({ projectId: 'dummy-project' })

    const backend = env.backend as HeadlessBackend

    await backend.performKeyPress('tab')

    expect(backend.getFocusedWidget()).toBeDefined()
  })
})
