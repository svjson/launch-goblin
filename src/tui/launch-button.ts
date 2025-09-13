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
    widget: { backend, parent, keyMap, options },
    state: { store },
  }: CtrlCtorParams) {
    super({
      widget: {
        backend,
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
    this.emit('launch')
  }
}
