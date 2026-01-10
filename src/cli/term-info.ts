import { inspectEnvironment } from '@src/bootstrap'

/**
 * Output terminal capabilities and exit process.
 */
export const termInfo = async () => {
  const env = await inspectEnvironment()
  console.log(`Shell: ${env.shell}`)
  console.log(`TTY: ${env.tty}`)
  console.log(`Color Mode: ${env.colorMode}`)
  console.log(`TERM: ${env.TERM}`)
  console.log(`Terminal: ${env.terminal}`)
  console.log(`Session name: ${env.nt ?? ''}`)
  process.exit(0)
}
