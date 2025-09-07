import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { CtrlCtorParams, KeyMap, Label, Store } from './framework'
import { ApplicationState } from '@src/project'
import { launchConfigByName, launchConfigCount } from '@src/config/query'
import { ListItem } from './framework/list-box'
import {
  applyConfig,
  ConfigType,
  ContextConfig,
  LaunchConfig,
} from '@src/config'
import { ItemSelectedEvent } from './framework/event'
import { Controller } from './framework/controller'
import { ConfirmDialog } from './framework/modal'
import { CustomListBox } from './framework/custom-list-box'

const transformEntries = (
  launchConfigs: Record<string, LaunchConfig>,
  type: ConfigType
): ConfigListItem[] =>
  Object.entries(launchConfigs).map(([name, _cfg]) => {
    return { id: name, label: name, type }
  })

export interface ConfigListItem extends ListItem {
  type: 'private' | 'shared'
}

export class ConfigSection extends CustomListBox<
  ConfigListItem[],
  ApplicationState
> {
  keyMap: KeyMap = this.extendKeyMap({
    delete: {
      legend: 'Delete Config',
      propagate: true,
      handler: this.bind(this.confirmDelete),
    },
  })

  events = this.extendEvents({
    selected: this.bind(this.configSelected),
  })

  constructor({
    parent,
    store,
    model,
    keyMap,
    options = {},
  }: CtrlCtorParams<ConfigListItem[], ApplicationState>) {
    super({
      parent,
      store,
      model,
      keyMap,
      options: mergeLeft(
        {
          width: 40,
          height: 14,
          label: ' Configurations ',
        },
        options
      ),
    })

    this.store.subscribe('config.global', () => {
      this.populateList()
      return true
    })
    this.store.subscribe('config.local', () => {
      this.populateList()
      return true
    })

    this.populateModel()

    this.inheritKeyMap(keyMap)

    this.populateList()

    this.adjustHeight()
  }

  populateModel() {
    const config: ContextConfig = this.store.get('config')
    this.model = [
      ...transformEntries(config.local.launchConfigs, 'shared'),
      ...transformEntries(config.global.launchConfigs, 'private'),
    ]
  }

  populateList() {
    this.populateModel()
    this.removeAllChildren()
    for (let i = 0; i < this.model.length; i++) {
      const item = this.model[i]
      this.addChild(
        {
          component: ConfigItemBox,
          model: item,
        },
        {
          top: i + 1,
        }
      )
    }

    this.adjustHeight()
    this.focusable = this.model.length > 0
    if (this.focusedIndex >= this.children.length) {
      this.nextChild(-1)
    }
  }

  adjustHeight() {
    this.widget.height = Math.min(
      14,
      launchConfigCount(this.store.get('config')) + 4
    )
  }

  configSelected(event: ItemSelectedEvent<ListItem>) {
    const config = launchConfigByName(event.item.id, this.store.get('config'))
    if (config) {
      applyConfig(config, this.store!.get('project'))
      this.store.set('config.activeConfigName', event.item.id)
    }
    for (let i = 0; i < this.children.length; i++) {
      ;(this.children[i] as ConfigItemBox).selected = i === this.focusedIndex
    }
  }

  confirmDelete() {
    this.emit({
      type: 'action',
      action: {
        type: 'open-modal',
        details: {
          create: <M, SM>({
            screen,
            store,
          }: {
            screen: blessed.Widgets.Screen
            model: M
            store: Store<SM>
          }) =>
            new ConfirmDialog({
              screen,
              store,
              model: {
                title: ' Delete Configuration ',
                message: `Are you sure you want to delete the configuration?`,
                options: [{ option: 'yes', buttonText: 'Delete' }, 'cancel'],
                onConfirm: {
                  type: 'action',
                  action: {
                    type: 'delete-config',
                    details: {
                      configId: this.store.get('config.activeConfigName'),
                      //                      configType: this.configList.getSelectedItem()?.type,
                    },
                  },
                },
              },
            }),
          source: this,
        },
      },
    })
  }
}

class ConfigItemBox extends Controller {
  focusable = true

  selected = false

  constructor({
    parent,
    model,
    keyMap,
    options,
  }: CtrlCtorParams<ConfigListItem>) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent,
            height: 1,
            focusable: true,
            style: {
              focus: {
                bg: 'blue',
              },
              select: {
                bg: 'white',
              },
            },
          },
          options
        )
      ),
      model
    )

    const currBg = () => {
      return this.widget.screen.focused === this.widget
        ? this.widget.style.focus.bg
        : this.selected
          ? this.widget.style.select.bg
          : undefined
    }

    const nameLabel = this.addChild(
      {
        component: Label,
        model: { text: model.label },
      },
      {
        left: 1,
        style: {
          focus: {
            bg: 'blue',
            fg: 'black',
          },
        },
      }
    )

    const typeLabel = this.addChild(
      {
        component: Label,
        model: { text: model.type },
      },
      {
        right: 1,
        style: {
          fg: model.type === 'private' ? 'orange' : 'green',
        },
      }
    )

    this.layout.bind('bg', currBg)
    nameLabel.layout.bind('bg', currBg)
    typeLabel.layout.bind('bg', currBg)
    nameLabel.layout.bind('fg', () => (this.selected ? 'black' : '#ffffff'))

    this.inheritKeyMap(keyMap)
  }
}
