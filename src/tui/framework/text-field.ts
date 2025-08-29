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

export class TextField extends Controller {
  item: TextFieldModel

  textInput: TextInput

  constructor(
    { parent, model, keyMap, options }: CtrlCtorParams,
    item: TextFieldModel
  ) {
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
          typeof item.label === 'string' ? { text: item.label } : item.label,
      },
      { top: 1 }
    )
    this.textInput = this.addChild(TextInput, { top: 1 }, { value: item.value })

    this.focusedIndex = 1
    this.item = item
  }

  getText() {
    return this.textInput.getText()
  }
}

export class TextInput extends Controller<blessed.Widgets.TextboxElement> {
  item: TextInputModel

  constructor(
    { parent, model, keyMap, options }: CtrlCtorParams,
    item: TextInputModel
  ) {
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

    this.item = item

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
