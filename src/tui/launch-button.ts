import { Button, CtrlCtorParams } from './framework'

export class LaunchButtonController extends Button {
  focusable = true

  keyMap = {
    enter: {
      legend: 'Launch',
      handler: this.bind(this.launch),
    },
  }

  constructor({
    widget: { env, parent, keyMap, options },
    state: { store },
  }: CtrlCtorParams) {
    super({
      widget: {
        env,
        parent,
        keyMap,
        options,
      },
      state: {
        model: { text: 'Launch' },
        store,
      },
    })
    this.inheritKeyMap(keyMap)
  }

  launch() {
    this.emit({ type: 'action', action: { type: 'launch' } })
  }
}
