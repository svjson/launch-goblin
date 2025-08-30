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
    'S-tab': {
      propagate: true,
      legend: 'Prev Section',
      handler: this.bind(() => this.nextChild(-1)),
    },
  }

  events = {
    focus: this.bind(this.componentFocused),
  }

  componentSection: ComponentSection
  footer: FooterController

  constructor({
    screen,
    model,
    store,
  }: {
    screen: blessed.Widgets.Screen
    model: ApplicationState
    store: Store<ApplicationState>
  }) {
    super(
      blessed.box({
        parent: screen,
        width: '100%',
        height: '100%',
        style: { fg: 'default' },
      }),
      model,
      store
    )
    this.store = store
    this.screen = screen

    this.addChild(HeaderController)
    this.componentSection = this.addChild({
      component: ComponentSection,
      model: store.get<Project>('project').components,
      store,
    })
    this.addChild(LaunchButtonController, {
      top: Number(this.componentSection.bottom()) + 3,
    })
    this.addChild(
      {
        component: ConfigSection,
        model: store.get('config'),
        store,
      },
      {
        top: this.componentSection.top(),
        left:
          Number(this.componentSection.left()) +
          Number(this.componentSection.width()) +
          4,
      }
    )
    this.footer = this.addChild(FooterController)
  }

  componentFocused(event: FocusEvent) {
    this.footer.applyContext(event.component)
  }

  emit(event: Event) {
    super.emit(event)
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
