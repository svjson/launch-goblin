import blessed from 'neo-blessed'

import { ApplicationState } from '@src/project'
import { Controller } from './framework'
import { LaunchButtonController } from './launch-button'
import { RunnableSelectController } from './runnable-select'
import { FooterController } from './footer'
import { HeaderController } from './header'
import { SaveConfigDialog } from './save-config-dialog'

export class MainController extends Controller<
  blessed.Widgets.BoxElement,
  ApplicationState
> {
  screen: blessed.Widgets.Screen

  keyMap = {
    'C-s': {
      propagate: true,
      handler: this.bind(this.saveConfig),
    },
    tab: {
      propagate: true,
      handler: this.bind(this.nextChild),
    },
  }

  constructor({
    screen,
    model,
  }: {
    screen: blessed.Widgets.Screen
    model: ApplicationState
  }) {
    super(
      blessed.box({
        parent: screen,
        width: '100%',
        height: '100%',
        style: { fg: 'default' },
      }),
      model
    )
    this.screen = screen

    this.addChild(HeaderController)
    this.addChild(RunnableSelectController)
    this.addChild(LaunchButtonController)
    this.addChild(FooterController)
  }

  saveConfig() {
    const dialog = new SaveConfigDialog({
      screen: this.screen,
      model: this.model,
    })

    dialog.on('*', (event: Event) => {
      if (event.type === 'destroyed') {
        this.focus()
      }
      this.emit(event)
    })

    dialog.focus()
  }

  emit(event: Event | string) {
    super.emit(event)
  }
}
