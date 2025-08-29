import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller } from './controller'
import { Store } from './store'

export class ModalDialog<Model> extends Controller<
  blessed.Widgets.BoxElement,
  Model
> {
  keyMap = {
    escape: {
      propagate: true,
      legend: 'Cancel',
      handler: this.bind(this.destroy),
    },
    tab: {
      propagate: true,
      legend: 'Next',
      handler: this.bind(this.nextChild),
    },
  }

  screen: blessed.Widgets.Screen

  constructor({
    screen,
    store,
    options = {},
  }: {
    screen: blessed.Widgets.Screen
    store: Store<Model>
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
      store
    )

    this.screen = screen
    this.screen.append(this.widget)
  }

  destroy() {
    super.destroy()
  }
}
