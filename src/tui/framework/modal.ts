import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller } from './controller'
import { Event } from './event'
import { Store } from './store'
import { Label } from './label'
import { Button } from './button'
import { add, withSign } from './layout'
import { KeyMap } from './keymap'

export interface ModalCtorParams<Model, StoreModel> {
  screen: blessed.Widgets.Screen
  model: Model
  store?: Store<StoreModel>
  keyMap?: KeyMap
  options?: blessed.Widgets.ElementOptions
}

export interface ModalDialogModel {
  title?: string
}

export class ModalDialog<
  Model extends ModalDialogModel = ModalDialogModel,
  StoreModel = any,
> extends Controller<blessed.Widgets.BoxElement, Model, StoreModel> {
  keyMap: KeyMap = {
    escape: {
      propagate: true,
      legend: 'Cancel',
      handler: this.bind(this.destroy),
    },
    tab: {
      propagate: true,
      legend: 'Next',
      handler: this.bind(this.nextChild),
    },
  }

  screen: blessed.Widgets.Screen

  constructor({
    screen,
    model,
    store,
    keyMap,
    options = {},
  }: ModalCtorParams<Model, StoreModel>) {
    super(
      blessed.box(
        mergeLeft(
          {
            top: `center`,
            left: 'center',
            width: '50%',
            height: 6,
            border: 'line',
            label: model.title,
            tags: true,
            ch: ' ',
            style: {
              border: { fg: 'white' },
            },
            bg: 'black',
          },
          options
        )
      ),
      model,
      store
    )

    this.screen = screen
    this.screen.append(this.widget)

    if (keyMap) {
      this.inheritKeyMap({ replace: false, keys: keyMap })
    }
  }

  destroy() {
    super.destroy()
  }
}

export type ConfirmOptionId = 'yes' | 'no' | 'cancel'

export interface ConfirmButtonOption {
  option: ConfirmOptionId
  buttonText: string
}

export type ConfirmOption = ConfirmOptionId | ConfirmButtonOption

export interface ConfirmDialogModel {
  title?: string
  message?: string
  options?: ConfirmOption[]
  buttonSpacing?: number
  onConfirm?: Event | (() => void)
  onCancel?: Event | (() => void)
  onDecline?: Event | (() => void)
}

const DEFAULT_BUTTON_TEXT = {
  yes: 'Yes',
  no: 'No',
  cancel: 'Cancel',
}

export class ConfirmDialog<
  Model extends ConfirmDialogModel = ConfirmDialogModel,
  StoreModel = any,
> extends ModalDialog<Model, StoreModel> {
  btnActions = {
    yes: this.bind(this.onConfirm),
    no: this.bind(this.onDecline),
    cancel: this.bind(this.onCancel),
  }

  keyMap = {
    escape: {
      legend: 'Cancel',
      propagate: true,
      handler: this.bind(this.onCancel),
    },
    tab: {
      propagate: true,
      legend: 'Next',
      handler: this.bind(this.nextChild),
    },
  }

  constructor({
    screen,
    store,
    model,
    options = {},
  }: ModalCtorParams<Model, StoreModel>) {
    super({
      screen,
      store,
      model,
      options: mergeLeft(
        {
          height: 10,
        },
        options
      ),
    })

    const { message, buttonSpacing = 2 } = model

    const buttons = (model.options ?? ['yes', 'no']).map((opt) =>
      typeof opt === 'string'
        ? {
            option: opt,
            buttonText: DEFAULT_BUTTON_TEXT[opt],
          }
        : opt
    )

    model.options = buttons

    let vPos = 1

    if (message) {
      this.addChild(
        {
          component: Label,
          model: { text: message },
        },
        {
          top: vPos,
          left: 2,
        }
      )
      vPos += 2
    }

    const buttonWidths: number[] = buttons.map(
      (btn) => btn.buttonText.length + 4
    )
    const buttonBarWidth = buttonWidths.reduce((w, bw) => {
      return w + (w > 0 ? buttonSpacing : 0) + bw + 4
    }, 0)

    buttons.forEach((btn, i) => {
      const button = this.addChild(
        {
          component: Button,
          model: { text: btn.buttonText },
        },
        {
          top: vPos,
          left: `50%${withSign(-(buttonBarWidth / 2) + add(...buttonWidths.slice(0, i)) + i * buttonSpacing)}`,
        }
      )
      button.on('pressed', () => {
        this.btnActions[btn.option]()
      })
    })

    if (!options.width) {
      this.widget.width = Math.max(
        buttonBarWidth + 4,
        (message ?? '').length + 8
      )
    }

    if (!options.height) {
      this.widget.height = Math.max(4, vPos + 4)
    }
  }

  hasOption(opt: ConfirmOptionId) {
    return (this.model.options as ConfirmButtonOption[]).some(
      (o) => o.option === opt
    )
  }

  #fireHandler(handler: Event | (() => void) | undefined) {
    if (handler === undefined) return
    if (typeof handler === 'function') {
      handler()
    } else {
      this.emit(handler)
    }
  }

  onConfirm() {
    this.#fireHandler(this.model.onConfirm)
    this.destroy()
  }

  onDecline() {
    this.#fireHandler(this.model.onDecline)
    this.destroy()
  }

  onCancel() {
    if (this.hasOption('cancel')) {
      this.#fireHandler(this.model.onCancel)
      this.destroy()
    }
  }
}
