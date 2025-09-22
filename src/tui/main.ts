import { ApplicationState, Project } from '@src/project'
import {
  ApplicationController,
  ApplicationCtrlCtorParams,
  Backend,
  Button,
  Event,
  FocusEvent,
  Store,
} from './framework'
import { ComponentSection } from './component-section'
import { FooterController } from './footer'
import { HeaderController } from './header'
import { SaveConfigDialog } from './save-config-dialog'
import { ConfigSection } from './config-section'

/**
 * The main TUI component of the Launch Goblin user interface
 */
export class MainController extends ApplicationController<ApplicationState> {
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

  components = this.defineComponents({
    header: HeaderController,
  })

  componentSection: ComponentSection
  configSection: ConfigSection
  launchButton: Button
  footer: FooterController

  constructor(params: ApplicationCtrlCtorParams<ApplicationState>) {
    super(params)

    this.componentSection = this.addChild(ComponentSection, {
      model: this.store
        .get<Project>('project')
        .components.filter((cmp) =>
          this.model.project.launchers[0].components.includes(cmp.id)
        ),
      store: this.store,
    })

    this.launchButton = this.addChild({
      component: Button,
      model: { text: 'Launch' },
    })
    this.launchButton.layout.bind(
      'top',
      () => Number(this.componentSection.bottom()) + 1
    )
    this.launchButton.on('pressed', () => {
      this.emit({ type: 'action', action: { type: 'launch' } })
    })

    this.configSection = this.addChild(ConfigSection)
    this.configSection.layout.bind('top', () => this.componentSection.top())
    this.configSection.layout.bind(
      'left',
      () =>
        Number(this.componentSection.left()) +
        Number(this.componentSection.width()) +
        4
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
    this.emit({
      type: 'action',
      action: {
        type: 'open-modal',
        details: {
          source: this,
          create: <M, SM>({}: {
            backend: Backend
            model: M
            store: Store<SM>
          }) =>
            new SaveConfigDialog({
              env: this.env,
              store: this.store,
            }),
        },
      },
    })
  }
}
