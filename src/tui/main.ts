import blessed from 'neo-blessed'

import { ApplicationState, Project } from '@src/project'
import { Controller, Event, FocusEvent, Store } from './framework'
import { LaunchButtonController } from './launch-button'
import { ComponentSection } from './component-section'
import { FooterController } from './footer'
import { HeaderController } from './header'
import { SaveConfigDialog } from './save-config-dialog'
import { ConfigSection } from './config-section'

export class MainController extends Controller<
  blessed.Widgets.BoxElement,
  ApplicationState
> {
  screen: blessed.Widgets.Screen

  keyMap = {
    'C-s': {
      propagate: true,
      legend: 'Save Configuration',
      handler: this.bind(this.saveConfig),
    },
    tab: {
      propagate: true,
      legend: 'Next Section',
      handler: this.bind(this.nextChild),
    },
  }

  events = {
    focus: this.bind(this.componentFocused),
  }

  componentSection: ComponentSection
  footer: FooterController

  constructor({
    screen,
    store,
  }: {
    screen: blessed.Widgets.Screen
    store: Store<ApplicationState>
  }) {
    super(
      blessed.box({
        parent: screen,
        width: '100%',
        height: '100%',
        style: { fg: 'default' },
      }),
      store
    )
    this.screen = screen

    this.addChild(HeaderController)
    this.componentSection = this.addChild({
      component: ComponentSection,
      model: store.get<Project>('project').components,
      store,
    })
    this.addChild(LaunchButtonController)
    this.addChild(ConfigSection, {
      top: this.componentSection.top(),
      left:
        Number(this.componentSection.left()) +
        Number(this.componentSection.width()) +
        4,
    })
    this.footer = this.addChild(FooterController)
  }

  componentFocused(event: FocusEvent) {
    this.footer.applyContext(event.component)
  }

  saveConfig() {
    const dialog = new SaveConfigDialog({
      screen: this.screen,
      store: this.store,
    })

    dialog.on('*', (event: Event) => {
      if (event.type === 'destroyed') {
        this.focus()
      }
      this.receive(event)
    })

    dialog.focus()
  }
}
