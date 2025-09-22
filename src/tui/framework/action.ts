export type ActionMap = Record<string, ActionHandler>

export type ActionHandler =
  | ((action: Action) => Promise<any> | any)
  | (() => Promise<any> | any)

export const ActionsMeta = Symbol('actions-meta')

export interface Action {
  type: string
  details?: any
}

export function action(id: string) {
  return function <This, Value extends (this: This, action: any) => any>(
    value: Value,
    context: ClassMethodDecoratorContext<This, Value>
  ) {
    context.addInitializer(function (this: any) {
      const ctor = this.constructor
      ctor[ActionsMeta] ??= {}
      ctor[ActionsMeta][id] = context.name
    })
    return value
  }
}
