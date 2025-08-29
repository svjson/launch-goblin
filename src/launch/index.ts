import { ProjectComponent } from '@src/project'
import { spawn } from 'node:child_process'

export const launch = async (components: ProjectComponent[]) => {
  const child = spawn(
    'npx',
    [
      'turbo',
      'run',
      'dev',
      ...components.flatMap((c) => ['--filter', c.package]),
    ],
    {
      stdio: 'inherit',
    }
  )

  child.on('exit', () => {
    process.exit(0)
  })
}
