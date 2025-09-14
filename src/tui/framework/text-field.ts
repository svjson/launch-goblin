import { Controller, CtrlCtorParams } from './controller'
import { Event } from './event'
import { Label, LabelItem } from './label'
import { mergeLeft } from '@whimbrel/walk'
import { TextFieldWidget, Widget } from './widget'

export interface TextFieldModel {
  label: string | LabelItem
  value: string
}

export interface TextInputModel {
  value: string
}

export class TextField extends Controller<Widget, TextFieldModel> {
  textInput: TextInput

  constructor({
    widget: { backend, parent, keyMap, options },
    state: { model },
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createBox(
        mergeLeft(
          {
            height: 2,
            width: '100%',
          },
          options
        )
      ),
      model
    )
    this.setParent(parent)

    this.inheritKeyMap(keyMap)

    this.addChild(
      {
        component: Label,
        model:
          typeof model.label === 'string' ? { text: model.label } : model.label,
      },
      { top: 0 }
    )
    this.textInput = this.addChild(
      TextInput,
      { top: 1 },
      { value: model.value }
    )

    this.textInput.on('text-changed', (event: Event) => {
      this.emit(event)
    })

    this.focusedIndex = 1
  }

  getText() {
    return this.textInput.getText()
  }
}

export class TextInput extends Controller<TextFieldWidget, TextInputModel> {
  constructor({
    widget: { backend, parent, keyMap, options },
    state: { model },
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createTextField({
        width: '100%',
        height: 1,
        color: 'white',
        background: 'blue',
        raw: {
          keys: true,
        },
        ...(options ?? {}),
      }),
      model
    )
    this.setParent(parent)

    this.widget.onSubmit(() => {
      this.emit({ type: 'text-changed', value: this.widget.getText() })
    })
    this.widget.onCancel(() => {})

    this.inheritKeyMap(keyMap)
  }

  getText() {
    return this.widget.getText()
  }
}
