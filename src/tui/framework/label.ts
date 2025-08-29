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

  constructor({ parent, model = { text: '' } }: CtrlCtorParams) {
    super(
      blessed.text({
        parent: parent,
        content: model.text,
      }),
      model
    )
  }
}
