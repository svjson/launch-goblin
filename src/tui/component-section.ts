import {
  Checkbox,
  CheckboxEvent,
  Controller,
  CtrlCtorParams,
  Label,
  OptionBar,
} from './framework'
import { mergeLeft } from '@whimbrel/walk'
import { juxt } from '@whimbrel/array'
import { ApplicationState, Project } from '@src/project'
import { CheckboxItem } from './framework/checkbox'
import { Widget } from './framework/widget'
import { resolveComponentStyle } from './framework/theme'
import { SessionComponent } from '@src/project/state'
import { pushUnique } from '@whimbrel/array'

/**
 * TUI Component containing checkboxes and options for launchable
 * components.
 */
export class ComponentSection extends Controller<
  Widget,
  SessionComponent[],
  ApplicationState
> {
  keyMap = this.defineKeys({
    up: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.prevChild,
    },
    down: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.nextChild,
    },
  })

  events = this.defineEvents({
    checkbox: this.onCheck,
  })

  focusedIndex = 0

  components: SessionComponent[]

  constructor({
    widget: { env },
    state: { model = [], store },
  }: CtrlCtorParams<SessionComponent[], ApplicationState>) {
    super(
      env,
      env.backend.createBox({
        width: Math.max(
          4 + ' Select Components to Launch '.length,
          10 +
            Math.max(
              ...model.map(
                (cmp) =>
                  cmp.component.name.length +
                  Math.max(0, ...cmp.component.targets.map((t) => t.length))
              )
            )
        ),
        height: Math.max(
          15,
          model.reduce((h, c) => {
            h++
            if (
              store.get<Project>('project').launcherOf(c.component.id)?.features
                .launcherTargets === 'multi'
            )
              h += c.component.targets.length
            return h
          }, 0) + 4
        ),
        top: '25%',
        left: 'center',
        keys: true,
        mouse: true,
        border: {
          type: 'line',
          label: ' Select Components to Launch ',
        },
        focusable: true,
        scrollable: true,
        alwaysScroll: true,
      }),
      model,
      store
    )

    this.components = model

    model.forEach((c, i) => {
      const launcher = this.store
        .get<Project>('project')
        .launcherOf(c.component.id)

      const targetSelectable = launcher?.features.componentTargets === 'multi'
      const multiSelect = launcher?.features.launcherTargets === 'multi'

      this.addChild({
        component: ComponentItem,
        model: {
          component: c as SessionComponent,
          targetSelectable,
          targetChildren: multiSelect,
          index: i,
        } as ComponentItemModel,
        style: {
          top: i + 1,
          width: '100%-3',
        },
      })

      if (multiSelect) {
        c.component.targets.forEach((target, ti) => {
          const lastChild = ti === c.component.targets.length - 1
          this.addChild({
            component: ComponentTargetItem,
            model: {
              component: c as SessionComponent,
              target: target,
              cmpIndex: i,
              targetIndex: ti,
              lastChild,
            } as ComponentTargetModel,
            style: {
              top: i + ti + 2,
              width: '100%-3',
            },
          })
        })
      }
    })

    this.store!.subscribe('config.activeConfigName', () => {
      juxt(this.children, this.components).forEach(([checkbox, cmp]) => {
        if (checkbox && cmp) {
          const item = checkbox as ComponentItem
          item.setSelected(cmp.state.selected ?? false, true)
          item.setTargets(cmp.state.targets ?? ['dev'])

          const launcher = this.store
            .get<Project>('project')
            .launcherOf(cmp.component.id)

          if (launcher?.features.launcherTargets === 'multi') {
            this.getChildItemComponents(cmp.component.id).forEach((child) => {
              child.setSelected(
                (cmp.state.targets ?? []).includes(child.model.target),
                true
              )
            })
          }
        }
      })
      return true
    })

    this.children[this.focusedIndex]?.focus()
  }

  getItemComponent(itemId: string) {
    return this.children.find(
      (c) => c.model.component.component.id === itemId
    ) as ComponentItem
  }

  getChildItemComponents(itemId: string): ComponentTargetItem[] {
    return this.children.filter(
      (c) => c.model.target && c.model.component.component.id === itemId
    ) as ComponentTargetItem[]
  }

  onCheck(event: CheckboxEvent) {
    if (event.item.parentId) {
      const parent = this.getItemComponent(event.item.parentId)
      parent.silent = true
      parent.setSelected(parent.model.component.state.targets.length > 0, true)
      parent.silent = false
    } else {
      const children = this.getChildItemComponents(event.item.id)
      children.forEach((c) => {
        c.setSelected(event.checked, true)
      })
    }
  }

  applySelection() {
    this.children[this.focusedIndex]?.focus()
    this.emit('dirty')
  }
}

type AbstractItemModel = {
  component: SessionComponent
}

export type ComponentItemModel = AbstractItemModel & {
  targetSelectable: boolean
  targetChildren: boolean
  index: number
}

export type ComponentTargetModel = AbstractItemModel & {
  cmpIndex: number
  targetIndex: number
  target: string
  lastChild: boolean
}

class AbstractComponentItem<
  M extends AbstractItemModel = ComponentItemModel,
> extends Controller<Widget, M, ApplicationState> {
  focusable = true
  silent = false

  events = this.defineEvents({
    checkbox: this.onChecked,
  })

  keyMap = this.defineKeys({
    enter: {
      legend: 'Toggle Selection',
      group: 'focused',
      propagate: true,
      handler: () => this.getCheckbox().toggle(),
    },
  })

  constructor({
    widget: { env, options },
    state: { model },
  }: CtrlCtorParams<M>) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            height: 1,
            focusable: true,
          },
          resolveComponentStyle(env.theme, 'CheckBox', env.tty.colorMode),
          options
        )
      ),
      model
    )
  }

  getCheckbox() {
    return this.children[0] as Checkbox
  }

  onChecked(event: CheckboxEvent) {
    this.model.component.state.selected = event.checked
    if (!this.silent) this.emit(event)
  }

  setSelected(sel: boolean, silent?: boolean) {
    const currentSilentFlag = this.silent
    if (silent === true) this.silent = true
    this.getCheckbox().setSelected(sel)
    this.silent = currentSilentFlag
  }
}

class ComponentItem extends AbstractComponentItem {
  keyMap = this.defineKeys(
    this.model.targetSelectable
      ? {
          left: {
            legend: 'Cycle target',
            group: 'focused',
            propagate: true,
            handler: () => this.cycleTarget(-1),
          },
          right: {
            legend: 'Cycle target',
            group: 'focused',
            propagate: true,
            handler: () => this.cycleTarget(),
          },
        }
      : {}
  )

  components = this.defineComponents({
    checkbox: {
      component: Checkbox,
      model: {
        id: this.model.component.component.id,
        label: this.model.component.component.name,
        index: this.model.index,
        checked: this.model.component.state.selected,
      } as CheckboxItem,
      style: {
        left: 1,
        focusable: false,
      },
    },
    target: {
      component: Label,
      model: {
        text: this.model.component.state.targets.join(' '),
      },
      style: {
        right: 0,
        color: 'white',
        ':focused': {
          background: 'blue',
        },
      },
    },
  })

  constructor(params: CtrlCtorParams) {
    super(params)

    if (!this.model.targetSelectable || this.model.targetChildren) {
      this.components.target.hide()
    }
  }

  cycleTarget(amount: number = 1) {
    if (!this.model.targetSelectable) return

    const currentIndex = this.model.component.component.targets.indexOf(
      this.model.component.state.targets[0]
    )

    const newIndex =
      (currentIndex + amount + this.model.component.component.targets.length) %
      this.model.component.component.targets.length

    this.setTargets([this.model.component.component.targets[newIndex]])
  }

  setTargets(targets: string[]) {
    this.model.component.state.targets[0] = targets[0]

    // FIXME: Setting the model should be enough here!
    // this.components.target.model.text =
    //   this.model.component.state.targets.join(' ')
    this.components.target.set(
      'text',
      this.model.component.state.targets.join(' ')
    )
    this.emit('dirty')
  }
}

class MultiTargetItem extends AbstractComponentItem {
  keyMap = this.defineKeys({
    space: {
      legend: 'Toggle Target',
      group: 'focused',
      propagate: true,
      handler: () => (this.children[1] as OptionBar).toggle(),
    },
    ...(this.model.targetSelectable
      ? {
          left: {
            legend: 'Previous Target',
            group: 'nav',
            propagate: true,
            handler: () => this.components.targets.prevChild(),
          },
          right: {
            legend: 'Next target',
            group: 'nav',
            propagate: true,
            handler: () => this.components.targets.nextChild(),
          },
        }
      : {}),
  })

  components = this.defineComponents({
    checkbox: {
      component: Checkbox,
      model: {
        id: this.model.component.component.id,
        label: this.model.component.component.name,
        index: this.model.index,
        checked: this.model.component.state.selected,
      } as CheckboxItem,
      style: {
        left: 1,
        focusable: false,
      },
    },
    targets: {
      component: OptionBar,
      model: this.model.component.component.targets.map((t) => ({
        id: t,
        label: t,
        selected: this.model.component.state.targets.includes(t),
      })),
      style: {
        right: 0,
        color: 'white',
        width: 30,
        focusable: false,
        ':focused': {
          background: 'blue',
        },
      },
    },
  })

  constructor(params: CtrlCtorParams) {
    super(params)
    if (!this.model.targetSelectable || this.model.targetChildren) {
      this.components.targets.hide()
    }
  }

  cycleTarget(amount: number = 1) {
    if (!this.model.targetSelectable) return

    const currentIndex = this.model.component.component.targets.indexOf(
      this.model.component.state.targets[0]
    )

    const newIndex =
      (currentIndex + amount + this.model.component.component.targets.length) %
      this.model.component.component.targets.length

    this.setTargets([this.model.component.component.targets[newIndex]])
  }

  setTargets(targets: string[]) {
    this.model.component.state.targets[0] = targets[0]

    // FIXME: Setting the model should be enough here!
    // this.components.target.model.text =
    //   this.model.component.state.targets.join(' ')
    this.components.targets.set(
      'text',
      this.model.component.state.targets.join(' ')
    )
    this.emit('dirty')
  }
}

class ComponentTargetItem extends AbstractComponentItem<ComponentTargetModel> {
  components = this.defineComponents({
    connector: {
      component: Label,
      model: {
        text: this.model.lastChild ? '└──' : '├──',
      },
      style: {
        left: 2,
      },
    },
    checkbox: {
      component: Checkbox,
      model: {
        id: this.model.component.component.id + '/' + this.model.target,
        parentId: this.model.component.component.id,
        label: this.model.target,
        index: this.model.cmpIndex,
        checked: this.model.component.state.targets.includes(this.model.target),
      } as CheckboxItem,
      style: {
        left: 6,
        focusable: false,
      },
    },
  })

  onChecked(event: CheckboxEvent) {
    if (event.checked) {
      pushUnique(this.model.component.state.targets, this.model.target)
    } else if (this.model.component.state.targets.includes(this.model.target)) {
      this.model.component.state.targets.splice(
        this.model.component.state.targets.indexOf(this.model.target),
        1
      )
    }
    if (!this.silent) this.emit(event)
  }

  getCheckbox() {
    return this.children[1] as Checkbox
  }
}
