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

const isObject = (value: unknown): value is Record<PropertyKey, unknown> => Object.prototype.toString.call(value) === '[object Object]'

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

const isTypedArray = (v: unknown): v is TypedArray => ArrayBuffer.isView(v) && 'length' in v

export const equal = (a: any, b: any): boolean => {
  if (a === b) return true

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false

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

    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false
      for (const i of a.keys()) {
        if (!b.has(i)) return false
      }
      for (const i of a.entries()) {
        if (!equal(i[1], b.get(i[0]))) return false
      }
      return true
    }

    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false
      for (const i of a.values()) {
        if (!b.has(i)) return false
      }
      return true
    }

    if (isTypedArray(a) && isTypedArray(b)) {
      length = a.length
      if (length != b.length) return false
      for (let i = length - 1; i !== -1; i--) {
        if (a[i] !== b[i]) return false
      }
      return true
    }

    if (a.constructor === RegExp) {
      return a.source === b.source && a.flags === b.flags
    }
    if (a instanceof Error) return a.name === b.name && a.message === b.message
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString()

    if (isObject(a)) {
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

    return false
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b
}
