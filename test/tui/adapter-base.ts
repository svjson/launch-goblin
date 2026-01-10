import { Button, Controller, HeadlessBackend } from '@src/tui/framework'

export const pathEntry = (thisSection: Controller, descendant?: Controller) => {
  if (!descendant) return '<No Focus>'
  const descProto = Object.getPrototypeOf(descendant)
  const parent = descendant?.parent
  return parent
    ? `${descProto?.constructor.name}(${parent.children.indexOf(descendant) ?? '-'})`
    : descProto.constructor.name
}

export interface AdapterBase<Cmp extends Controller = Controller> {
  section: Cmp
  getButton: (label: string) => Button | undefined
  isFocused: () => boolean
  repeatUntil(
    desc: string,
    cond: () => boolean,
    action: () => Promise<any>
  ): Promise<any>
}

export const makeAdapterBase = <Cmp extends Controller = Controller>(
  backend: HeadlessBackend,
  section: Cmp
): AdapterBase<Cmp> => {
  return {
    section,
    getButton(label: string) {
      return this.section.children
        .filter((c) => c instanceof Button)
        .find((c) => c.model.text.trim() === label.trim())
    },
    isFocused() {
      return this.section.isFocused({ down: true })
    },
    async repeatUntil(
      desc: string,
      cond: () => boolean,
      action: () => Promise<any>
    ) {
      let iter = 0
      while (!cond() && iter < 20) {
        iter++
        await action()
      }

      if (iter >= 20)
        throw new Error(`Failed to ${desc} after ${iter} repetitions.`)
    },
  }
}
