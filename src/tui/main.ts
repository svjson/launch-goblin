import blessed from 'neo-blessed'
import { Controller } from './controller'
import { RunnableSelectController } from './runnable-select'
import { LaunchButtonController } from './launch-button'
import { FooterController } from './footer'
import { Model } from 'src/project'
import { HeaderController } from './header'

export class MainController extends Controller {
  screen: blessed.Widgets.Screen

  keyMap = {
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
    model: Model
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

    this.applyKeyMap()
  }

  emit(event: Event | string) {
    super.emit(event)
  }
}
