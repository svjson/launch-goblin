import { ProjectComponent } from '@src/project'
import { spawn } from 'node:child_process'

let launched = false

export const launch = async (components: ProjectComponent[]) => {
  if (launched) return
  launched = true

  const bin = 'npx'
  const args = [
    'turbo',
    'run',
    'dev',
    ...components.flatMap((c) => ['--filter', c.package]),
  ]

  const child = spawn(bin, args, {
    stdio: 'inherit',
  })

  process.on('SIGINT', () => {
    child.kill('SIGINT')
  })

  process.on('SIGTERM', () => {
    child.kill('SIGINT')
  })

  child.on('exit', () => {
    process.exit(0)
  })
}
