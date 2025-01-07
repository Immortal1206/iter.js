import { Iter } from './iter'

export const isIterable = <T>(value: unknown): value is Iterable<T> =>
  value != null && typeof value === 'object' && Symbol.iterator in value

export const isNullUndefined = (value: unknown): value is null | undefined => value == null

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

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array

function equalBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
  if (buffer1.byteLength !== buffer2.byteLength) {
    return false
  }

  const view1 = new Uint8Array(buffer1)
  const view2 = new Uint8Array(buffer2)

  for (let i = 0; i < view1.length; i++) {
    if (view1[i] !== view2[i]) {
      return false
    }
  }
  return true
}

function equalTypedArrays(arr1: TypedArray, arr2: TypedArray) {
  if (arr1.length !== arr2.length) {
    return false
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }
  return true
}

function equalDataViews(view1: DataView, view2: DataView) {
  if (
    view1.byteOffset !== view2.byteOffset ||
    view1.byteLength !== view2.byteLength
  ) {
    return false
  }

  for (let i = 0; i < view1.byteLength; i++) {
    if (view1.getUint8(i) !== view2.getUint8(i)) {
      return false
    }
  }
  return true
}

const SHOULD_NOT_COMPARE = [
  'Promise',
  'WeakMap',
  'WeakSet',
  'WeakRef'
]

const getTag = (v: unknown) => Object.prototype.toString.call(v).slice(8, -1)

export const equal = (a: any, b: any): boolean => {
  if (
    SHOULD_NOT_COMPARE.includes(getTag(a)) ||
    SHOULD_NOT_COMPARE.includes(getTag(b))
  ) return false

  if (a === b) return true

  if (typeof a === 'number' && typeof b === 'number') {
    return Number.isNaN(a) && Number.isNaN(b)
  }

  if (isFunction(a) || isFunction(b)) return false

  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object'
  ) {
    return false
  }

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false

  if (isFunction(a.eq) && isFunction(b.eq)) return a.eq(b) && b.eq(a)

  let length: number
  if (Array.isArray(a) && Array.isArray(b)) {
    length = a.length
    if (length != b.length) return false
    for (let i = length - 1; i !== -1; i--) {
      if (!equal(a[i], b[i])) return false
    }
    return true
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const i of a.keys()) {
      if (!b.has(i)) return false
    }
    for (const i of a.entries()) {
      if (!equal(i[1], b.get(i[0]))) return false
    }
    return true
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const i of a.values()) {
      if (!b.has(i)) return false
    }
    return true
  }

  if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
    return equalBuffers(a, b)
  }

  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    if (a instanceof DataView && b instanceof DataView) {
      return equalDataViews(a, b)
    }
    return equalTypedArrays(a as TypedArray, b as TypedArray)
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags
  }

  if (a instanceof Error && b instanceof Error) {
    return a.name === b.name && a.message === b.message
  }

  const keys = Object.keys(a)
  length = keys.length
  if (length !== Object.keys(b).length) return false
  for (let i = length - 1; i !== -1; i--) {
    if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
  }
  for (let i = length - 1; i !== -1; i--) {
    const key = keys[i]
    if (!equal(a[key], b[key])) return false
  }

  return true
}

export const enum Position {
  /**
   * The first element in the `Iter`.
   */
  First = 'first',
  /**
   * Neither the first nor the last element in the `Iter`.
   */
  Middle = 'middle',
  /**
   * The last element in the `Iter`.
   */
  Last = 'last',
  /**
   * The only element in the `Iter`.
   */
  Only = 'only',
}