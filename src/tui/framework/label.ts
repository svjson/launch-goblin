import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './controller'

export interface LabelItem {
  text: string
}

export class Label<Model extends LabelItem> extends Controller<
  blessed.Widgets.TextElement,
  Model
> {
  focusable = false

  constructor({ parent, model }: CtrlCtorParams, label: LabelItem) {
    super(
      blessed.text({
        parent: parent,
        content: label.text,
      }),
      model
    )
  }
}
