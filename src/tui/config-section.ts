import blessed from 'neo-blessed'
import { Controller, CtrlCtorParams } from './framework'
import { ApplicationState } from '@src/project'
import { launchConfigByName, launchConfigCount } from '@src/config/query'
import { mergeLeft } from '@whimbrel/walk'
import { ListBox, ListItem } from './framework/list-box'
import { applyConfig, ContextConfig, LaunchConfig } from '@src/config'
import { ItemSelectedEvent } from './framework/event'

const transformEntries = (
  launchConfigs: Record<string, LaunchConfig>,
  type: string
) =>
  Object.entries(launchConfigs).map(([name, cfg]) => {
    return [name, { ...cfg, type }]
  })

export class ConfigSection extends Controller<
  blessed.Widgets.BoxElement,
  ApplicationState
> {
  events = {
    selected: this.bind(this.configSelected),
  }

  constructor({
    parent,
    store,
    keyMap,
    options,
  }: CtrlCtorParams<ApplicationState>) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent: parent,
            label: ' Configurations ',
            width: 40,
            height: Math.min(14, launchConfigCount(store!.get('config')) + 4),
            border: 'line',
            keys: true,
            scrollable: true,
            alwaysScroll: true,
          },
          options
        )
      ),
      store!
    )

    this.inheritKeyMap(keyMap)

    const config: ContextConfig = store!.get('config')

    this.addChild(
      {
        component: ListBox,
        model: [
          ...transformEntries(config.global.launchConfigs, 'private'),
          ...transformEntries(config.local.launchConfigs, 'shared'),
        ].map(
          ([name, _cfg]) =>
            ({
              id: name,
              label: name,
            }) as ListItem
        ),
      },
      { left: 1, top: 1, width: '100%-4' }
    )
  }

  configSelected(event: ItemSelectedEvent<ListItem>) {
    const config = launchConfigByName(event.item.id, this.store.get('config'))
    if (config) {
      applyConfig(config, this.store.get('project'))
      this.store.set('config.activeConfigName', event.item.id)
    }
  }
}
