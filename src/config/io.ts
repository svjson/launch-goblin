import os from 'node:os'
import path from 'node:path'

import { ContextConfig, GlobalConfig, LaunchConfig, LGConfig } from './types'
import { ApplicationState, Project } from '@src/project'
import { toLaunchConfigComponents } from './apply'
import { FileSystem } from '@whimbrel/core'

export const localConfigPath = (project: Project) =>
  path.join(project.root, '.goblin')

export const globalConfigPath = (project: Project) =>
  path.join(os.homedir(), '.goblin', project.id)

const emptyConfig = (): LGConfig => ({
  launchConfigs: {},
})

const ensureLaunchConfigStructure = (lc: LaunchConfig) => {
  if (!lc.defaultTarget) lc.defaultTarget = 'dev'
  Object.values(lc.components).forEach((c) => {
    if (!c.targets) c.targets = [lc.defaultTarget]
  })
}

const ensurePath = async (
  fs: FileSystem,
  filePath: string
): Promise<string> => {
  if (await fs.exists(filePath)) return filePath
  if (await fs.exists(path.dirname(filePath))) return filePath
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  return filePath
}

const readConfigFile = async (
  fs: FileSystem,
  cfgFile: string
): Promise<LGConfig> => {
  if (await fs.exists(cfgFile)) {
    const cfg: LGConfig = await fs.readJson(cfgFile, 'utf8')
    Object.values(cfg.launchConfigs).forEach((lc) => {
      ensureLaunchConfigStructure(lc)
    })
    return cfg
  }
  return emptyConfig()
}

const readGlobalConfigFile = async (
  fs: FileSystem,
  cfgFile: string
): Promise<GlobalConfig> => {
  const cfg = (await readConfigFile(fs, cfgFile)) as GlobalConfig
  if (!cfg.lastConfig) cfg.lastConfig = { defaultTarget: 'dev', components: {} }
  ensureLaunchConfigStructure(cfg.lastConfig)
  return cfg
}

export const readConfig = async (
  fs: FileSystem,
  project: Project
): Promise<ContextConfig> => {
  return {
    local: await readConfigFile(fs, localConfigPath(project)),
    global: await readGlobalConfigFile(fs, globalConfigPath(project)),
  }
}

export const saveLatestLaunch = async (
  fs: FileSystem,
  model: ApplicationState
) => {
  model.config.global.lastConfig = {
    defaultTarget: 'dev',
    components: toLaunchConfigComponents(model.session.components),
  }
  await saveGlobalConfig(fs, model.project, model.config.global)
}

export const saveLocalConfig = async (
  fs: FileSystem,
  project: Project,
  config: LGConfig
): Promise<void> => {
  await fs.writeJson(await ensurePath(fs, localConfigPath(project)), config)
}

export const saveGlobalConfig = async (
  fs: FileSystem,
  project: Project,
  config: GlobalConfig
): Promise<void> => {
  await fs.writeJson(await ensurePath(fs, globalConfigPath(project)), config)
}
