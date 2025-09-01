import { spawn } from 'child_process'

import { LaunchCommand } from './types'

let launched = false

export const launch = async (cmd: LaunchCommand) => {
  if (launched) return
  launched = true

  const { bin, args } = cmd

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
