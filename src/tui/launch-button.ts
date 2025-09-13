import { Button, CtrlCtorParams } from './framework'

export class LaunchButtonController extends Button {
  focusable = true

  keyMap = {
    enter: {
      legend: 'Launch',
      handler: this.bind(this.launch),
    },
  }

  constructor({ backend, parent, store, keyMap, options }: CtrlCtorParams) {
    super({
      backend,
      parent,
      model: { text: 'Launch' },
      store,
      keyMap,
      options,
    })
    this.inheritKeyMap(keyMap)
  }

  launch() {
    this.emit('launch')
  }
}
