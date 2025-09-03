import blessed from 'neo-blessed'
import { CtrlCtorParams, Store } from './framework'
import { ApplicationState } from '@src/project'
import { launchConfigByName, launchConfigCount } from '@src/config/query'
import { mergeLeft } from '@whimbrel/walk'
import { ListBox, ListItem } from './framework/list-box'
import {
  applyConfig,
  ConfigType,
  ContextConfig,
  LaunchConfig,
} from '@src/config'
import { ItemSelectedEvent } from './framework/event'
import { Controller } from './framework/controller'
import { ConfirmDialog } from './framework/modal'

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

export class ConfigSection extends Controller<
  blessed.Widgets.BoxElement,
  ContextConfig,
  ApplicationState
> {
  keyMap = {
    delete: {
      legend: 'Delete Config',
      propagate: true,
      handler: this.bind(this.confirmDelete),
    },
  }

  events = {
    selected: this.bind(this.configSelected),
  }

  configList: ListBox<ConfigListItem>

  constructor({
    parent,
    store,
    model,
    keyMap,
    options,
  }: CtrlCtorParams<ContextConfig, ApplicationState>) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent: parent,
            label: ' Configurations ',
            width: 40,
            height: 14,
            border: 'line',
            keys: true,
            scrollable: true,
            alwaysScroll: true,
          },
          options
        )
      ),
      model!,
      store
    )

    this.store.subscribe('config.global', () => {
      this.populateList()
      return true
    })
    this.store.subscribe('config.local', () => {
      this.populateList()
      return true
    })

    this.inheritKeyMap(keyMap)

    const listItems = this.modelToListItems()

    this.configList = this.addChild(
      {
        component: ListBox,
        model: listItems,
      },
      { left: 1, top: 1, width: '100%-4' }
    )

    this.focusable = listItems.length > 0
    this.adjustHeight()
  }

  modelToListItems() {
    const config: ContextConfig = this.store.get('config')
    return [
      ...transformEntries(config.local.launchConfigs, 'shared'),
      ...transformEntries(config.global.launchConfigs, 'private'),
    ]
  }

  populateList() {
    const listItems = this.modelToListItems()
    this.configList.setItems(listItems)
    this.adjustHeight()
    this.focusable = listItems.length > 0
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
                      configId: this.model.activeConfigName,
                      configType: this.configList.getSelectedItem()?.type,
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
