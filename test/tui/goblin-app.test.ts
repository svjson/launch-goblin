import { describe, expect, it } from 'vitest'
import { HeadlessBackend } from '@src/tui/framework'
import { runGoblinApp } from 'test/fixtures'

describe('LaunchGoblinApp', () => {
  it('should start with component section focused', async () => {
    const { env } = await runGoblinApp({ projectId: 'dummy-project' })

    const backend = env.backend as HeadlessBackend

    await backend.performKeyPress('tab')

    expect(backend.getFocusedWidget()).toBeDefined()
  })
})
