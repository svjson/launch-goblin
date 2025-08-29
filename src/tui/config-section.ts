import blessed from 'neo-blessed'
import { Controller, CtrlCtorParams } from './framework'
import { ApplicationState } from '@src/project'
import { launchConfigByName, launchConfigCount } from '@src/config/query'
import { mergeLeft } from '@whimbrel/walk'
import { ListBox, ListItem } from './framework/list-box'
import { applyConfig, LaunchConfig } from '@src/config'
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
    model,
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
            height: Math.min(14, launchConfigCount(model.config) + 4),
            border: 'line',
            keys: true,
            scrollable: true,
            alwaysScroll: true,
          },
          options
        )
      ),
      model
    )

    this.inheritKeyMap(keyMap)

    this.addChild(
      {
        component: ListBox,
        model: [
          ...transformEntries(model.config.global.launchConfigs, 'private'),
          ...transformEntries(model.config.local.launchConfigs, 'shared'),
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
    const config = launchConfigByName(event.item.id, this.model.config)
    if (config) applyConfig(config, this.model.project)
  }
}
