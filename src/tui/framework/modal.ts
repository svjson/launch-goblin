import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller } from './controller'
import { Store } from './store'
import { Label } from './label'

export interface ModalCtorParams<Model, StoreModel> {
  screen: blessed.Widgets.Screen
  model: Model
  store?: Store<StoreModel>
  options?: blessed.Widgets.ElementOptions
}

export interface ModalDialogModel {
  title?: string
}

export class ModalDialog<
  Model extends ModalDialogModel = ModalDialogModel,
  StoreModel = any,
> extends Controller<blessed.Widgets.BoxElement, Model, StoreModel> {
  keyMap = {
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
    options = {},
  }: ModalCtorParams<Model, StoreModel>) {
    super(
      blessed.box(
        mergeLeft(
          {
            top: 'center',
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

    const { message } = model

    const buttons = (model.options ?? ['yes', 'no']).map((opt) =>
      typeof opt === 'string'
        ? {
            option: opt,
            buttonText: DEFAULT_BUTTON_TEXT[opt],
          }
        : opt
    )

    if (message) {
      this.addChild(Label)
    }
  }
}
