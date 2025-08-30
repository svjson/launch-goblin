#!/usr/bin/env node
import blessed from 'neo-blessed'

import { launch } from './launch'
import { readProject } from './project'
import { initTui, destroy, createStore, Store } from './tui/framework'
import { MainController } from './tui'
import {
  Action,
  ActionEvent,
  LogEvent,
  FocusEvent,
  KeyMap,
} from './tui/framework'
import { ApplicationState } from './project'
import {
  saveLatestLaunch,
  saveLocalConfig,
  toLaunchConfigComponents,
} from './config'

const performAction = async (
  screen: blessed.Widgets.Screen,
  action: Action,
  model: ApplicationState,
  store: Store<ApplicationState>
) => {
  if (action.type === 'create-config') {
    store.set(['config', 'local', 'launchConfigs', action.details.name], {
      components: toLaunchConfigComponents(model.project.components),
    })
    await saveLocalConfig(model.project, model.config.local)
  } else if (action.type === 'open-modal') {
    const dialog = action.details.create({ model, store, screen })
    dialog.on('*', (event: Event) => {
      if (event.type === 'destroyed') {
        action.details.source.focus()
      }
      action.details.source.receive(event)
    })

    dialog.focus()
  } else if (action.type === 'delete-config') {
    const { configId, configType } = action.details
    store.delete([
      'config',
      configType === 'shared' ? 'local' : 'global',
      'launchConfigs',
      configId,
    ])
  }
}

const main = async () => {
  const model: ApplicationState = await readProject()

  const screen = initTui()

  const log: string[] = []

  let activeKeyMap: KeyMap = {}

  const store = createStore(model)

  const mainCtrl = new MainController({ screen, store, model })

  mainCtrl.on('dirty', () => {
    screen.render()
  })

  mainCtrl.on('launch', async () => {
    destroy(screen)
    const selected = model.project.components.filter((c) => c.selected)
    await saveLatestLaunch(model)
    await launch(selected)
  })

  mainCtrl.on('focus', (event: FocusEvent) => {
    activeKeyMap = event.component.keyMap
  })

  mainCtrl.on('log', (event: LogEvent) => {
    log.push(event.message)
  })

  mainCtrl.on('action', async (event: ActionEvent) => {
    await performAction(screen, event.action, model, store)
  })

  mainCtrl.focus()

  screen.on('keypress', (ch, key) => {
    if (activeKeyMap[key.full]) {
      activeKeyMap[key.full].handler(ch, key)
    }
  })

  screen.key(['q', 'C-c'], () => {
    destroy(screen)
    log.forEach((m) => console.log(m))
    process.exit(0)
  })

  screen.render()
}

main()
