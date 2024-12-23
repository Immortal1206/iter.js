import { Iter } from './iter'

export const isIterable = <T>(value: unknown): value is Iterable<T> =>
  value != null && typeof value === 'object' && Symbol.iterator in value

export const isNullUndefined = (value: unknown): value is null | undefined => value === null || value === undefined

export const isIter = <T>(value: unknown): value is Iter<T> => value instanceof Iter

export function assertNonNegative(value: number, name: string): asserts value is number {
  if (value < 0) {
    throw new Error(`Expected non-negative in ${name}, but got ${value}!`)
  }
}

export function assertInteger(value: number, name: string): asserts value is number {
  if (!Number.isInteger(value)) {
    throw new Error(`Expected integer in ${name}, but got ${value}!`)
  }
}

export function assertNonZero(value: number, name: string): asserts value is number {
  if (value === 0) {
    throw new Error(`Expected non-zero in ${name}, but got ${value}!`)
  }
}

export const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => typeof value === 'function'

export const id = <T>(value: T): T => value
