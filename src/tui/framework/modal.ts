import blessed from 'neo-blessed'

import { Controller } from './controller'
import { Model } from 'src/project'
import { mergeLeft } from '@whimbrel/walk'

export class ModalDialog extends Controller {
  keyMap = {
    escape: {
      propagate: true,
      handler: this.bind(this.destroy),
    },
    tab: {
      propagate: true,
      handler: this.bind(this.nextChild),
    },
  }

  screen: blessed.Widgets.Screen

  constructor({
    screen,
    model,
    options = {},
  }: {
    screen: blessed.Widgets.Screen
    model: Model
    options?: blessed.Widgets.ElementOptions
  }) {
    super(
      blessed.box(
        mergeLeft(
          {
            top: 'center',
            left: 'center',
            width: '50%',
            height: 6,
            border: 'line',
            label: ' Save Configuration ',
            tags: true,
            ch: ' ',
            style: {
              border: { fg: 'white' },
            },
            bg: 'black',
          },
          options
        )
      ),
      model
    )

    this.screen = screen
    this.screen.append(this.widget)
  }

  destroy() {
    super.destroy()
  }
}
