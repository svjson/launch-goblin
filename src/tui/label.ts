import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './controller'

export interface LabelItem {
  text: string
}

export class LabelController extends Controller<blessed.Widgets.TextElement> {
  focusable = false

  constructor({ parent, model, keyMap }: CtrlCtorParams, label: LabelItem) {
    super(
      blessed.text({
        parent: parent,
        content: label.text,
      }),
      model
    )
  }
}
