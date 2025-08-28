import blessed from 'neo-blessed'
import { Controller, CtrlCtorParams } from './controller'
import { LabelController, LabelItem } from './label'
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

    this.addChild(
      LabelController,
      { top: 1 },
      typeof item.label === 'string' ? { text: item.label } : item.label
    )
    this.addChild(TextInputController, { top: 1 }, { value: item.value })

    this.focusedIndex = 1
    this.item = item

    this.inheritKeyMap(keyMap)
    this.applyKeyMap(true)
  }
}

export class TextInputController extends Controller<blessed.Widgets.TextboxElement> {
  constructor(
    { parent, model, keyMap, options }: CtrlCtorParams,
    item: TextInputModel
  ) {
    super(
      blessed.textbox({
        parent,
        width: '70%',
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

    this.inheritKeyMap(keyMap)
    this.applyKeyMap(true)

    this.widget.on('keypress', (ch, key) => {})
  }
}
