import { mergeLeft } from '@whimbrel/walk'

import { CtrlCtorParams, Label, Store } from './framework'
import { ApplicationState } from '@src/project'
import {
  launchConfigByContent,
  launchConfigByName,
  launchConfigCount,
} from '@src/config/query'
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

export const LAST_LAUNCH_LABEL = '< Last Launch >'
export const LAST_LAUNCH_ID = '__!last_launch'

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
  type: 'private' | 'shared' | 'recent'
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

  showLastLaunched: boolean = false

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

    this.store.subscribe('config.private', () => {
      this.populateList()
      return true
    })

    this.store.subscribe('config.shared', () => {
      this.populateList()
      return true
    })

    const lastLaunched = this.store.get<LaunchConfig>(
      'config.private.lastConfig'
    )
    this.populateModel()

    if (Object.keys(lastLaunched.components).length) {
      const existingLast = launchConfigByContent(
        lastLaunched,
        this.store.get<ContextConfig>('config')
      )

      if (existingLast) {
        this.focusedIndex = this.model.findIndex(
          (i) => i.label === existingLast.name
        )
      } else {
        this.showLastLaunched = true
      }
    }

    this.populateModel()
    this.populateList()

    this.adjustHeight()
  }

  populateModel() {
    const config: ContextConfig = this.store.get('config')
    this.model = [
      ...(this.showLastLaunched
        ? [
            {
              id: LAST_LAUNCH_ID,
              label: LAST_LAUNCH_LABEL,
              type: 'recent',
              selected: true,
            } satisfies ConfigListItem,
          ]
        : []),
      ...transformEntries(config.shared.launchConfigs, 'shared'),
      ...transformEntries(config.private.launchConfigs, 'private'),
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
      Math.min(
        14,
        Math.max(
          (this.showLastLaunched ? 1 : 0) +
            launchConfigCount(this.store.get('config')),
          1
        ) + 4
      )
    )
  }

  configSelected(event: ItemSelectedEvent<ConfigListItem>) {
    const config =
      event.item.type === 'recent'
        ? this.store.get<LaunchConfig>('config.private.lastConfig')
        : launchConfigByName(event.item.id, this.store.get('config'))
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
        textAlign: this.isRecentType() ? 'center' : 'left',
        ...(this.isRecentType() ? { width: '100%-2' } : {}),
        ':focused': {
          color: 'black',
        },
      },
    },

    typeLabel: {
      component: Label,
      model: {
        text: this.model.type,
      },
      style: {
        right: 1,
        hidden: this.isRecentType(),
        color: this.model.type === 'private' ? 208 : 'green',
      },
    },
  })

  isRecentType() {
    return this.model.type === 'recent'
  }

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
