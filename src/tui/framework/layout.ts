import { Controller } from './controller'

export const add = (...nums: number[]) => {
  return nums.reduce((r, n) => r + n, 0)
}

export const withSign = (num: number): string => `${num >= 0 ? '+' : ''}${num}`

export type LayoutProperty =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'bg'
  | 'fg'
  | 'focused:fg'
  | 'focused:bg'
  | 'selected:fg'
  | 'selected:bg'
  | 'width'
  | 'height'

export type ValueProvider = () => string | number | undefined

export class ControllerLayout {
  constructor(private ctrl: Controller) {}

  private bindings: Partial<Record<LayoutProperty, ValueProvider>> = {}

  bind(prop: LayoutProperty, provider: ValueProvider): void {
    this.bindings[prop] = provider
  }

  apply() {
    Object.entries(this.bindings).forEach(([prop, provider]) => {
      this.ctrl.set(prop as LayoutProperty, provider())
    })
  }
}
