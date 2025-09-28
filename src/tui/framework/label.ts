import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { LabelWidget } from './widget'
import { resolveComponentStyle } from './theme'

export interface LabelItem {
  text: string
}

export class Label<Model extends LabelItem = LabelItem> extends Controller<
  LabelWidget,
  Model
> {
  focusable = false

  constructor({
    widget: { env, options },
    state: { model = { text: '' } },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createLabel(
        mergeLeft(
          {
            label: model.text ?? '',
          },
          resolveComponentStyle(env.theme, 'Label', env.tty.colorMode),
          options
        )
      ),
      model
    )
  }

  setText(text: string) {
    this.model.text = text ?? ''
    this.widget.setText(this.model.text)
  }
}
