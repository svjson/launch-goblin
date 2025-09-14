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
import { LabelItem } from './framework/label'
import { Backend } from './framework/backend'

/**
 * Transform LaunchConfig instances from the context configuration
 * or application state to ConfigListItem model instances.
 */
const transformEntries = (
  launchConfigs: Record<string, LaunchConfig>,
  type: ConfigType
): ConfigListItem[] =>
  Object.entries(launchConfigs).map(([name, _cfg]) => {
    return { id: name, label: name, type }
  })

/**
 * Specialization of the ListItem model, adding configuration type
 */
export interface ConfigListItem extends ListItem {
  type: 'private' | 'shared'
}

/**
 * TUI Component containing project local(shared) and user(private)
 * configurations in a list box.
 *
 * Selection/activation of a configuration is immediate upon navigating
 * between the list items
 */
export class ConfigSection extends CustomListBox<
  ConfigItemBox,
  Label,
  LabelItem,
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
    widget: { backend, parent, keyMap, options = {} },
    state: { store, model },
  }: CtrlCtorParams<ConfigListItem[], ApplicationState>) {
    super({
      widget: {
        backend,
        parent,
        keyMap,
        options: mergeLeft(
          {
            width: 40,
            height: 14,
            raw: {
              label: ' Configurations ',
            },
          },
          options
        ),
      },
      state: {
        model,
        store,
      },
      itemCls: ConfigItemBox,
      emptyLabel: {
        component: Label,
        model: {
          text: '<No Configurations>',
        },
      },
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
    this.refreshItems()
    this.adjustHeight()
  }

  adjustHeight() {
    this.widget.set(
      'height',
      Math.min(14, Math.max(launchConfigCount(this.store.get('config')), 1) + 4)
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
            backend,
            store,
          }: {
            backend: Backend
            model: M
            store: Store<SM>
          }) =>
            new ConfirmDialog({
              backend,
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
                      configType: this.model[this.focusedIndex]?.type,
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
    widget: { backend, parent, options, keyMap },
    state: { model },
  }: CtrlCtorParams<ConfigListItem>) {
    super(
      backend,
      backend.createBox(
        mergeLeft(
          {
            height: 1,
            ':focused': {
              background: 'blue',
            },
            ':selected': {
              background: 'white',
            },
          },
          options
        )
      ),
      model
    )

    const currBg = () => {
      return this.widget.isFocused()
        ? this.widget.get('focused:bg')
        : this.selected
          ? this.widget.get('selected:bg')
          : undefined
    }

    const nameLabel = this.addChild(
      {
        component: Label,
        model: { text: model.label },
      },
      {
        left: 1,
        ':focused': {
          background: 'blue',
          color: 'black',
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
        color: model.type === 'private' ? 208 : 'green',
      }
    )

    this.layout.bind('bg', currBg)
    nameLabel.layout.bind('bg', currBg)
    typeLabel.layout.bind('bg', currBg)
    nameLabel.layout.bind('fg', () => (this.selected ? 'black' : '#ffffff'))

    this.inheritKeyMap(keyMap)
  }
}
