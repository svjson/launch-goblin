import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'

export interface LabelItem {
  text: string
}

export class Label<Model extends LabelItem = LabelItem> extends Controller<
  blessed.Widgets.TextElement,
  Model
> {
  focusable = false

  constructor({ parent, model = { text: '' }, options }: CtrlCtorParams) {
    super(
      blessed.text(
        mergeLeft(
          {
            parent: parent,
            content: model.text ?? '',
            transparent: true,
            tags: true,
            style: {},
          },
          options
        )
      ),
      model
    )
  }

  setText(text: string) {
    this.model.text = text ?? ''
    this.widget.content = this.model.text
  }
}
