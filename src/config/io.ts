import os from 'node:os'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { ContextConfig, GlobalConfig, LGConfig } from './types'
import { ApplicationState, Project } from '@src/project'
import { toLaunchConfigComponents } from './apply'

export const localConfigPath = (project: Project) =>
  path.join(project.root, '.goblin')

export const globalConfigPath = (project: Project) =>
  path.join(os.homedir(), '.goblin', project.id)

const emptyConfig = (): LGConfig => ({
  launchConfigs: {},
})

const ensurePath = async (filePath: string): Promise<string> => {
  if (existsSync(filePath)) return filePath
  if (existsSync(path.dirname(filePath))) return filePath
  await mkdir(path.dirname(filePath), { recursive: true })
  return filePath
}

const readConfigFile = async (cfgFile: string): Promise<LGConfig> => {
  if (existsSync(cfgFile)) {
    return JSON.parse(await readFile(cfgFile, 'utf8'))
  }
  return emptyConfig()
}

const readGlobalConfigFile = async (cfgFile: string): Promise<GlobalConfig> => {
  const cfg = (await readConfigFile(cfgFile)) as GlobalConfig
  if (!cfg.lastConfig) cfg.lastConfig = { components: {} }
  return cfg
}

export const readConfig = async (project: Project): Promise<ContextConfig> => {
  return {
    local: await readConfigFile(localConfigPath(project)),
    global: await readGlobalConfigFile(globalConfigPath(project)),
  }
}

export const saveLatestLaunch = async (model: ApplicationState) => {
  model.config.global.lastConfig = {
    components: toLaunchConfigComponents(model.project.components),
  }
  await saveGlobalConfig(model.project, model.config.global)
}

export const saveLocalConfig = async (
  project: Project,
  config: LGConfig
): Promise<void> => {
  await writeFile(
    await ensurePath(localConfigPath(project)),
    JSON.stringify(config, null, 2),
    'utf8'
  )
}

export const saveGlobalConfig = async (
  project: Project,
  config: GlobalConfig
): Promise<void> => {
  await writeFile(
    await ensurePath(globalConfigPath(project)),
    JSON.stringify(config, null, 2),
    'utf8'
  )
}
