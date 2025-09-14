export interface FocusOptions {
  focusable?: boolean
}

export interface ScrollBehavior {
  scrollable?: boolean
  alwaysScroll?: boolean
}

export type Behavior = FocusOptions & ScrollBehavior
