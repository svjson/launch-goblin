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
    backend,
    parent,
    model = { text: '' },
    options,
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createLabel(
        mergeLeft(
          {
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
    this.setParent(parent)
  }

  setText(text: string) {
    this.model.text = text ?? ''
    this.widget.setText(this.model.text)
  }
}
