import { Iter } from '.'

export const isIterable = <T>(value: unknown): value is Iterable<T> | Iter<T> => isIter(value) ||
  value != null && typeof value === 'object' && Symbol.iterator in value

export const isNullUndefined = (value: unknown): value is null | undefined => value === null || value === undefined

export const isIter = <T>(value: unknown): value is Iter<T> => value instanceof Iter
