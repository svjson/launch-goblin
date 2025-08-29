import { PropertyPath, readPath, writePath } from '@whimbrel/walk'
import equal from 'fast-deep-equal'

export interface Subscriber<T> {
  propertyPath: PropertyPath
  handler: SubscriberFunction<T>
}

export type SubscriberFunction<T> = (
  propertyPath: PropertyPath,
  value: T
) => boolean

export const arrayPath = (path: PropertyPath): string[] => {
  if (Array.isArray(path)) return path
  return path.split('.')
}

export const matchesPath = (path: PropertyPath, cmpPath: PropertyPath) => {
  const qPath = arrayPath(path)
  const compPath = arrayPath(cmpPath)

  if (compPath.length > qPath.length) return false
  return equal(compPath, qPath.slice(0, compPath.length))
}

const publish = (
  subscribers: Subscriber<any>[],
  propertyPath: PropertyPath,
  value: any
) => {
  for (const subscriber of subscribers) {
    if (matchesPath(propertyPath, subscriber.propertyPath)) {
      subscriber.handler(propertyPath, value)
    }
  }
}

export interface Store<Model> {
  get<T>(propertyPath: PropertyPath): T
  set<T>(propertyPath: PropertyPath, value: T): void
  subscribe<T>(
    propertyPath: PropertyPath,
    subscriber: SubscriberFunction<T>
  ): void
}

export const createStore = <Model>(state: Model): Store<Model> => {
  const subscribers: Subscriber<any>[] = []

  const store = {
    get<T>(propertyPath: PropertyPath) {
      return readPath(state, propertyPath) as T
    },
    set<T>(propertyPath: PropertyPath, value: T) {
      writePath(state, propertyPath, value)
      publish(subscribers, propertyPath, value)
    },
    subscribe<T>(propertyPath: PropertyPath, handler: SubscriberFunction<T>) {
      subscribers.push({
        propertyPath,
        handler,
      })
    },
  }

  return store
}
