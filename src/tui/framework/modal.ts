import { mergeLeft } from '@whimbrel/walk'

import { ComponentEnvironment, Controller } from './controller'
import { TUIEvent } from './event'
import { Store } from './store'
import { Label } from './label'
import { Button } from './button'
import { add, withSign } from './layout'
import { KeyMap } from './keymap'
import { Widget, BoxOptions } from './widget'

export interface ModalCtorParams<Model, StoreModel> {
  env: ComponentEnvironment
  model: Model
  store?: Store<StoreModel>
  keyMap?: KeyMap
  options?: BoxOptions
}

export interface ModalDialogModel {
  title?: string
}

export class ModalDialog<
  Model extends ModalDialogModel = ModalDialogModel,
  StoreModel = any,
> extends Controller<Widget, Model, StoreModel> {
  keyMap = this.defineKeys({
    escape: {
      propagate: true,
      legend: 'Cancel',
      handler: this.destroy,
    },
    tab: {
      propagate: true,
      legend: 'Next',
      handler: this.nextChild,
    },
  })

  constructor({
    env,
    model,
    store,
    keyMap,
    options = {},
  }: ModalCtorParams<Model, StoreModel>) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            top: `center`,
            left: 'center',
            width: '50%',
            height: 6,
            border: {
              type: 'line',
              label: model.title,
              color: 'white',
            },
          },
          options
        )
      ),
      model,
      store
    )

    this.env.backend.addRoot(this.widget)

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
  onConfirm?: TUIEvent | (() => void)
  onCancel?: TUIEvent | (() => void)
  onDecline?: TUIEvent | (() => void)
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
    yes: this.onConfirm.bind(this),
    no: this.onDecline.bind(this),
    cancel: this.onCancel.bind(this),
  }

  keyMap = this.defineKeys({
    escape: {
      legend: 'Cancel',
      propagate: true,
      handler: this.onCancel,
    },
    tab: {
      propagate: true,
      legend: 'Next',
      handler: this.nextChild,
    },
  })

  constructor({
    env,
    store,
    model,
    options = {},
  }: ModalCtorParams<Model, StoreModel>) {
    super({
      env,
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
      this.addChild({
        component: Label,
        model: { text: message },
        style: {
          top: vPos,
          left: 2,
        },
      })
      vPos += 2
    }

    const buttonWidths: number[] = buttons.map(
      (btn) => btn.buttonText.length + 4
    )
    const buttonBarWidth = buttonWidths.reduce((w, bw) => {
      return w + (w > 0 ? buttonSpacing : 0) + bw + 4
    }, 0)

    buttons.forEach((btn, i) => {
      const button = this.addChild({
        component: Button,
        model: { text: btn.buttonText },
        style: {
          top: vPos,
          left: `50%${withSign(-(buttonBarWidth / 2) + add(...buttonWidths.slice(0, i)) + i * buttonSpacing)}`,
        },
      })
      button.on('pressed', () => {
        this.btnActions[btn.option]()
      })
    })

    if (!options.width) {
      this.widget.set(
        'width',
        Math.max(buttonBarWidth + 4, (message ?? '').length + 8)
      )
    }

    if (!options.height) {
      this.widget.set('height', Math.max(4, vPos + 4))
    }
  }

  hasOption(opt: ConfirmOptionId) {
    return (this.model.options as ConfirmButtonOption[]).some(
      (o) => o.option === opt
    )
  }

  #fireHandler(handler: TUIEvent | (() => void) | undefined) {
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
