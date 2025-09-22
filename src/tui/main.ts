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
  keyMap = this.defineKeys({
    'C-s': {
      propagate: true,
      legend: 'Save Configuration',
      handler: this.saveConfig,
    },
    tab: {
      propagate: true,
      legend: 'Next Section',
      handler: this.nextChild,
    },
    'S-tab': {
      propagate: true,
      legend: 'Prev Section',
      handler: () => this.nextChild(-1),
    },
  })

  events = this.defineEvents({
    focus: this.componentFocused,
  })

  components = this.defineComponents({
    header: HeaderController,

    componentSection: {
      component: ComponentSection,
      model: this.store
        .get<Project>('project')
        .components.filter((cmp) =>
          this.model.project.launchers[0].components.includes(cmp.id)
        ),
      store: this.store,
    },

    launchButton: {
      component: Button,
      model: { text: 'Launch' },
    },

    configSection: ConfigSection,

    footer: FooterController,
  })

  constructor(params: ApplicationCtrlCtorParams<ApplicationState>) {
    super(params)

    const { componentSection, configSection, launchButton } = this.components

    launchButton.layout.bind('top', () => Number(componentSection.bottom()) + 1)
    launchButton.on('pressed', () => {
      this.dispatch({ type: 'launch' })
    })

    configSection.layout.bind('top', () => componentSection.top())
    configSection.layout.bind(
      'left',
      () =>
        Number(componentSection.left()) + Number(componentSection.width()) + 4
    )

    this.focusedIndex = 1
  }

  componentFocused(event: FocusEvent) {
    this.components.footer.applyContext(event.component)
  }

  emit(event: Event) {
    super.emit(event)
  }

  saveConfig() {
    this.dispatch({
      type: 'open-modal',
      details: {
        source: this,
        create: <M, SM>({}: { backend: Backend; model: M; store: Store<SM> }) =>
          new SaveConfigDialog({
            env: this.env,
            store: this.store,
          }),
      },
    })
  }
}
