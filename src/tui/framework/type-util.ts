/**
 * Type-utility that extracts the element type of A[]
 */
export type ElementOf<A> = A extends (infer T)[] ? T : never

/**
 * Type-utility that isn't built into TypeScript because
 * of... reasons?
 */
export type Class<T> = abstract new (...args: any[]) => T
