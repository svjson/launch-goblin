/**
 * Type-utility that extracts the element type of A[]
 */
export type ElementOf<A> = A extends (infer T)[] ? T : never
