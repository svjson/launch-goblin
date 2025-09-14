import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { LabelWidget } from './widget'

export interface LabelItem {
  text: string
}

export class Label<Model extends LabelItem = LabelItem> extends Controller<
  LabelWidget,
  Model
> {
  focusable = false

  constructor({
    widget: { backend, parent, options },
    state: { model = { text: '' } },
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createLabel(
        mergeLeft(
          {
            label: model.text ?? '',
          },
          options
        )
      ),
      model
    )
    this.setParent(parent)
  }

  setText(text: string) {
    this.model.text = text ?? ''
    this.widget.setText(this.model.text)
  }
}
