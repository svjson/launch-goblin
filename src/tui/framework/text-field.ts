import blessed from 'neo-blessed'
import { Controller, CtrlCtorParams } from './controller'
import { Label, LabelItem } from './label'
import { mergeLeft } from '@whimbrel/walk'

export interface TextFieldModel {
  label: string | LabelItem
  value: string
}

export interface TextInputModel {
  value: string
}

export class TextField extends Controller<
  blessed.Widgets.BoxElement,
  TextFieldModel
> {
  textInput: TextInput

  constructor({ parent, model, keyMap, options }: CtrlCtorParams) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent,
            height: 2,
            width: '100%',
          },
          options
        )
      ),
      model
    )

    this.inheritKeyMap(keyMap)

    this.addChild(
      {
        component: Label,
        model:
          typeof model.label === 'string' ? { text: model.label } : model.label,
      },
      { top: 1 }
    )
    this.textInput = this.addChild(
      TextInput,
      { top: 1 },
      { value: model.value }
    )

    this.focusedIndex = 1
  }

  getText() {
    return this.textInput.getText()
  }
}

export class TextInput extends Controller<
  blessed.Widgets.TextboxElement,
  TextInputModel
> {
  constructor({ parent, model, keyMap, options }: CtrlCtorParams) {
    super(
      blessed.textbox({
        parent,
        width: '100%',
        height: 1,
        keys: true,
        style: {
          fg: 'white',
          bg: 'blue',
        },
        ...options,
      }),
      model
    )

    this.widget.on('submit', () => {
      this.emit({ type: 'text-changed', value: this.widget.content })
    })
    this.widget.on('cancel', () => {})

    this.inheritKeyMap(keyMap)
  }

  getText() {
    return this.widget.content
  }
}
