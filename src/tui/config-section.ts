import { mergeLeft } from '@whimbrel/walk'

import { CtrlCtorParams, Label, Store } from './framework'
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
import { ConfirmDialog } from './framework/modal'
import { CustomListBox, CustomListBoxItem } from './framework/custom-list-box'
import { LabelItem } from './framework/label'
import { ComponentEnvironment } from './framework/controller'

/**
 * Transform LaunchConfig instances from the context configuration
 * or application state to ConfigListItem model instances.
 */
const transformEntries = (
  launchConfigs: Record<string, LaunchConfig>,
  type: ConfigType
): ConfigListItem[] =>
  Object.entries(launchConfigs).map(([name, _cfg]) => {
    return { id: name, label: name, type, selected: false }
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
  keyMap = this.defineKeys({
    delete: {
      legend: 'Delete Config',
      propagate: true,
      handler: this.confirmDelete,
    },
  })

  events = this.defineEvents({
    selected: this.configSelected,
  })

  constructor({
    widget: { env, options = {} },
    state: { store, model },
  }: CtrlCtorParams<ConfigListItem[], ApplicationState>) {
    super({
      widget: {
        env,
        options: mergeLeft(
          {
            width: 40,
            height: 14,
            border: {
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
      applyConfig(
        config,
        this.store!.get('project'),
        this.store!.get('session')
      )
      this.store.set('config.activeConfigName', event.item.id)
    }
  }

  confirmDelete() {
    this.dispatch({
      type: 'open-modal',
      details: {
        create: <M, SM>({
          env,
          store,
        }: {
          env: ComponentEnvironment
          model: M
          store: Store<SM>
        }) =>
          new ConfirmDialog({
            env,
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
    })
  }
}

class ConfigItemBox extends CustomListBoxItem<ConfigListItem, ConfigListItem> {
  focusable = true

  components = this.defineComponents({
    nameLabel: {
      component: Label,
      model: { text: this.model.label },
      style: {
        left: 1,
        ':focused': {
          color: 'black',
        },
      },
    },

    typeLabel: {
      component: Label,
      model: { text: this.model.type },
      style: {
        right: 1,
        color: this.model.type === 'private' ? 208 : 'green',
      },
    },
  })

  constructor({
    widget: { env, options },
    state: { model },
  }: CtrlCtorParams<ConfigListItem>) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            height: 1,
            color: 'white',
            focusable: true,
            background: 'default',
            ':focused': {
              color: 'white',
              background: 'blue',
            },
            ':selected': {
              background: 'white',
              color: 'black',
            },
          },
          options
        )
      ),
      model
    )
  }
}
