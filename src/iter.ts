import { isMaybe, just, nothing, type Maybe } from 'error-null-handle'

import {
  assertInteger,
  assertNonNegative,
  assertNonZero,
  equal,
  id,
  isFunction,
  isIter,
  isIterable,
  isNullUndefined,
  Ordering,
  Position
} from './utils'
import type {
  Compacted,
  Comparable,
  FlatIterable,
  FlattedIter,
  IterMethods,
  RangeConfig
} from './@types/iter'

export class Iter<T> implements IterMethods<T> {
  #generator: () => Generator<T>

  constructor(generator: () => Generator<T>) {
    this.#generator = generator
  }

  static fromIterable<T>(iterable: Iterable<T>): Iter<T> {
    return new Iter(function* () {
      yield* iterable
    })
  }

  static repeat<T>(value: T | (() => T)): Iter<T> {
    const isFn = isFunction(value)
    return new Iter(function* () {
      while (true) {
        yield isFn ? value() : value
      }
    })
  }

  static empty<T>(): Iter<T> {
    return new Iter(function* (): Generator<T> { })
  }

  static once<T>(value: T): Iter<T> {
    return new Iter(function* () {
      yield value
    })
  }

  // #region adapter methods
  append(item: T): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      yield* gen()
      yield item
    })
  }

  chain(other: Iterable<T>): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      yield* gen()
      yield* other
    })
  }

  chunks(size: number): Iter<Iter<T>> {
    assertNonNegative(size, 'chunks')
    assertInteger(size, 'chunks')
    assertNonZero(size, 'chunks')
    const gen = this.#generator
    return new Iter(function* () {
      let chunk = Iter.empty<T>()
      let len = 0
      for (const value of gen()) {
        chunk = chunk.append(value)
        len += 1
        if (len === size) {
          yield chunk
          len = 0
          chunk = Iter.empty<T>()
        }
      }
      if (len > 0) {
        yield chunk
      }
    })
  }

  compact(): Iter<Compacted<T>> {
    return this.filterMap(id) as Iter<Compacted<T>>
  }

  concat(...others: Iterable<T>[]): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      yield* gen()
      for (const other of others) {
        yield* other
      }
    })
  }

  cycle(): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      while (true) {
        yield* gen()
      }
    })
  }

  dedup(): Iter<T> {
    return this.dedupBy(equal)
  }

  dedupBy(sameBucket: (a: T, b: T) => boolean): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      let prev: T | undefined
      for (const value of gen()) {
        if (prev === undefined || !sameBucket(prev, value)) {
          yield value
          prev = value
        }
      }
    })
  }

  dedupByKey<K>(getKey: (value: T) => K): Iter<T> {
    return this.dedupBy((a, b) => Object.is(getKey(a), getKey(b)))
  }

  enumerate(): Iter<[number, T]> {
    const gen = this.#generator
    return new Iter(function* () {
      let i = 0
      for (const value of gen()) {
        yield [i, value]
        i++
      }
    }) as Iter<[number, T]>
  }

  filter<U extends T>(fn: (value: T) => value is U): Iter<U>
  filter(fn: (value: T) => boolean): Iter<T>
  filter(fn: (value: T) => boolean): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        if (fn(value)) {
          yield value
        }
      }
    })
  }

  filterMap<U>(fn: (value: T) => U | undefined | null | Maybe<U>): Iter<U> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        const result = fn(value)
        if (isNullUndefined(result)) continue
        if (isMaybe<U>(result)) {
          if (result.isJust()) {
            yield result.unwrap()
          }
          continue
        }
        yield result
      }
    })
  }

  flat<D extends number = 1>(depth: D = 1 as D): FlattedIter<T, D> {
    assertNonNegative(depth, 'flat')
    assertNonZero(depth, 'flat')
    assertInteger(depth, 'flat')

    const gen = this.#generator
    function* flatten(iterable: Iterable<T>, depthLeft: number): Generator<FlatIterable<T, D>> {
      for (const value of iterable) {
        if (depthLeft > 0 && isIterable<T>(value)) yield* flatten(value, depthLeft - 1)
        else yield value as FlatIterable<T, D>
      }
    }

    return new Iter(() => flatten(gen(), depth))
  }

  flatMap<U>(fn: (value: T) => Iterable<U>): Iter<U> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        const result = fn(value)
        yield* result
      }
    })
  }

  inspect(fn: (value: T) => void): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        fn(value)
        yield value
      }
    })
  }

  interleave(other: Iterable<T>): Iter<T> {
    const gen1 = this.#generator
    const gen2 = other[Symbol.iterator].bind(other)
    return new Iter(function* () {
      const it1 = gen1()
      const it2 = gen2()
      let value1 = it1.next()
      let value2 = it2.next()
      while (!value1.done || !value2.done) {
        if (!value1.done) {
          yield value1.value
          value1 = it1.next()
        }
        if (!value2.done) {
          yield value2.value
          value2 = it2.next()
        }
      }
    })
  }

  interleaveShortest(other: Iterable<T>): Iter<T> {
    const gen1 = this.#generator
    const gen2 = other[Symbol.iterator].bind(other)
    return new Iter(function* () {
      const it1 = gen1()
      const it2 = gen2()
      let value1 = it1.next()
      let value2 = it2.next()
      while (!value1.done && !value2.done) {
        yield value1.value
        value1 = it1.next()
        yield value2.value
        value2 = it2.next()
      }
    })
  }

  intersperse(value: T | (() => T)): Iter<T> {
    const gen = this.#generator
    const isFn = isFunction(value)
    return new Iter(function* () {
      let isFirst = true
      for (const item of gen()) {
        if (!isFirst) {
          yield isFn ? value() : value
        }
        yield item
        isFirst = false
      }
    })
  }

  map<U>(fn: (value: T) => U): Iter<U> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        yield fn(value)
      }
    })
  }

  merge(other: Iterable<T>): Iter<T> {
    return this.mergeBy(other, (a, b) => a <= b)
  }

  mergeBy(other: Iterable<T>, isFirst: (a: T, b: T) => boolean): Iter<T> {
    const gen1 = this.#generator
    const gen2 = other[Symbol.iterator].bind(other)
    return new Iter(function* () {
      const it1 = gen1()
      const it2 = gen2()
      let value1 = it1.next()
      let value2 = it2.next()
      while (!value1.done && !value2.done) {
        if (isFirst(value1.value, value2.value)) {
          yield value1.value
          value1 = it1.next()
        } else {
          yield value2.value
          value2 = it2.next()
        }
      }
      while (!value1.done) {
        yield value1.value
        value1 = it1.next()
      }
      while (!value2.done) {
        yield value2.value
        value2 = it2.next()
      }
    })
  }

  mergeByKey<K>(other: Iterable<T>, getKey: (value: T) => K): Iter<T> {
    return this.mergeBy(other, (a, b) => getKey(a) <= getKey(b))
  }

  partition(fn: (value: T) => boolean): [Iter<T>, Iter<T>] {
    const gen = this.#generator
    return [
      new Iter(function* () {
        for (const value of gen()) {
          if (fn(value)) yield value
        }
      }),
      new Iter(function* () {
        for (const value of gen()) {
          if (!fn(value)) yield value
        }
      })
    ]
  }

  prepend(item: T): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      yield item
      yield* gen()
    })
  }

  scan<U>(fn: (acc: U, value: T) => U | null | undefined | Maybe<U>, initial: U): Iter<U> {
    const gen = this.#generator
    return new Iter(function* () {
      let acc = initial
      for (const value of gen()) {
        const result = fn(acc, value)
        if (isNullUndefined(result)) break
        if (isMaybe<U>(result)) {
          if (result.isNothing()) break
          acc = result.unwrap()
          yield acc
          continue
        }
        acc = result
        yield acc
      }
    })
  }

  skip(n: number): Iter<T> {
    assertNonNegative(n, 'skip')
    assertInteger(n, 'skip')
    const gen = this.#generator
    return new Iter(function* () {
      let i = 0
      for (const value of gen()) {
        if (i < n) {
          i++
          continue
        }
        yield value
      }
    })
  }

  skipWhile(shouldSkip: (value: T) => boolean): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      let skipped = false
      for (const value of gen()) {
        if (skipped) {
          yield value
          continue
        }
        if (shouldSkip(value)) continue
        skipped = true
        yield value
      }
    })
  }

  slice(start: number, end: number): Iter<T> {
    assertNonNegative(start, 'slice')
    assertInteger(start, 'slice')
    assertNonNegative(end, 'slice')
    assertInteger(end, 'slice')
    if (start > end) throw new Error('Start index must be less than end index!')
    const gen = this.#generator
    return new Iter(function* () {
      let i = 0
      const it = gen()
      while (i < start) {
        it.next()
        i++
      }
      for (let i = start; i < end; i++) {
        const { value, done } = it.next()
        if (done) break
        yield value
      }
    })
  }

  stepBy(step: number): Iter<T> {
    assertNonNegative(step, 'stepBy')
    assertNonZero(step, 'stepBy')
    assertInteger(step, 'stepBy')
    const gen = this.#generator
    return new Iter(function* () {
      let i = 0
      const it = gen()
      while (true) {
        const { value, done } = it.next()
        if (done) break
        if (i % step === 0) yield value
        i++
      }
    })
  }

  take(n: number): Iter<T> {
    assertNonNegative(n, 'take')
    assertInteger(n, 'take')
    const gen = this.#generator
    return new Iter(function* () {
      const it = gen()
      for (let i = 0; i < n; i++) {
        const { value, done } = it.next()
        if (done) break
        yield value
      }
    })
  }

  takeWhile(shouldTake: (value: T) => boolean): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        if (shouldTake(value)) {
          yield value
        } else {
          break
        }
      }
    })
  }

  unique(): Iter<T> {
    return this.uniqueByKey(id)
  }

  uniqueByKey<K>(fn: (value: T) => K): Iter<T> {
    const gen = this.#generator

    return new Iter(function* () {
      const seen = new Set<K>()
      for (const value of gen()) {
        const key = fn(value)
        if (seen.has(key)) continue
        seen.add(key)
        yield value
      }
    })
  }

  withPosition(): Iter<[Position, T]> {
    const gen = this.#generator
    return new Iter(function* () {
      const it = gen()
      let { value, done } = it.next()
      if (done) return

      let next = it.next()
      if (next.done) {
        yield [Position.Only, value]
        return
      }

      yield [Position.First, value]
      value = next.value

      while (true) {
        next = it.next()
        if (next.done) break
        yield [Position.Middle, value]
        value = next.value
      }

      yield [Position.Last, value]
    })
  }

  zip<U>(other: Iterable<U>): Iter<[T, U]> {
    const gen1 = this.#generator
    const gen2 = other[Symbol.iterator].bind(other)

    return new Iter(function* () {
      const it1 = gen1()
      const it2 = gen2()
      while (true) {
        const { value: val1, done: done1 } = it1.next()
        const { value: val2, done: done2 } = it2.next()

        if (done1 || done2) break

        yield [val1, val2] as [T, U]
      }
    }) as Iter<[T, U]>
  }

  zipWith<V, U = unknown>(other: Iterable<U>, fn: (a: T, b: U) => V): Iter<V> {
    const gen1 = this.#generator
    const gen2 = other[Symbol.iterator].bind(other)

    return new Iter(function* () {
      const it1 = gen1()
      const it2 = gen2()
      while (true) {
        const { value: val1, done: done1 } = it1.next()
        const { value: val2, done: done2 } = it2.next()

        if (done1 || done2) break

        yield fn(val1, val2)
      }
    })
  }
  // #endregion

  // #region consumer methods
  count(): number {
    let count = 0
    for (const _ of this.#generator()) {
      count++
    }
    return count
  }

  each(fn: (value: T) => void): void {
    for (const value of this.#generator()) {
      fn(value)
    }
  }

  eq(other: Iter<T>): boolean {
    return this.eqBy(other, equal)
  }

  eqBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean {
    if (!isIter(other)) return false
    const it1 = this.#generator()
    const it2 = other.#generator()

    while (true) {
      const { value: val1, done: done1 } = it1.next()
      const { value: val2, done: done2 } = it2.next()

      if (done1 && done2) return true
      if (done1 || done2) return false
      if (!fn(val1, val2)) return false
    }
  }

  every(fn: (value: T) => boolean): boolean {
    for (const value of this.#generator()) {
      if (!fn(value)) return false
    }
    return true
  }

  find(fn: (value: T) => boolean): Maybe<T> {
    for (const value of this.#generator()) {
      if (fn(value)) return just(value)
    }
    return nothing()
  }

  findIndex(fn: (value: T) => boolean): Maybe<number> {
    const it = this.#generator()
    let i = 0
    while (true) {
      const { value, done } = it.next()
      if (done) return nothing()
      if (fn(value)) return just(i)
      i++
    }
  }

  findMap<U>(fn: (value: T) => U | undefined | null | Maybe<U>): Maybe<U> {
    for (const value of this.#generator()) {
      const result = fn(value)
      if (isNullUndefined(result)) continue
      if (isMaybe<U>(result)) {
        if (result.isJust()) return result
        continue
      }
      return just(result)
    }
    return nothing()
  }

  first(): Maybe<T> {
    const it = this.#generator()
    const { value, done } = it.next()
    return done ? nothing() : just(value)
  }

  groupToMap<K>(keySelector: (value: T) => K): Map<K, Iter<T>> {
    const it = this.#generator()
    const map = new Map<K, Iter<T>>()

    for (const value of it) {
      const key = keySelector(value)
      if (map.has(key)) {
        map.set(key, map.get(key)!.append(value))
      } else {
        map.set(key, Iter.once(value))
      }
    }

    return map
  }

  groupToObject<K extends PropertyKey>(keySelector: (value: T) => K): Record<K, Iter<T>> {
    const it = this.#generator()
    const obj = {} as Record<K, Iter<T>>

    for (const value of it) {
      const key = keySelector(value)
      if (obj[key]) {
        obj[key] = obj[key].append(value)
      } else {
        obj[key] = Iter.once(value)
      }
    }

    return obj
  }

  isEmpty(): boolean {
    return this.#generator().next().done!
  }

  isUnique(): boolean {
    return this.isUniqueByKey(id)
  }

  isUniqueByKey(fn: (value: T) => unknown): boolean {
    const it = this.#generator()
    const seen = new Set()

    for (const value of it) {
      const key = fn(value)
      if (seen.has(key)) return false
      seen.add(key)
    }

    return true
  }

  join(sep: string): string {
    const it = this.#generator()
    let res = ''
    let first = true
    for (const value of it) {
      if (!first) res += sep
      res += value
      first = false
    }
    return res
  }

  last(): Maybe<T> {
    const it = this.#generator()
    let res = nothing<T>()
    while (true) {
      const { value, done } = it.next()
      if (done) return res
      res = just(value)
    }
  }

  max(): Maybe<T> {
    return this.maxBy((a, b) => {
      if (a > b) return Ordering.Greater
      if (a < b) return Ordering.Less
      return Ordering.Equal
    })
  }

  maxBy(fn: (a: T, b: T) => Ordering): Maybe<T> {
    const it = this.#generator()
    let max = nothing<T>()
    for (const value of it) {
      if (
        max.isNothing() ||
        [Ordering.Equal, Ordering.Greater].includes(fn(value, max.unwrap()))
      ) {
        max = just(value)
      }
    }
    return max
  }

  maxByKey(fn: (value: T) => Comparable): Maybe<T> {
    return this.maxBy((a, b) => {
      const keyA = fn(a)
      const keyB = fn(b)
      if (keyA > keyB) return Ordering.Greater
      if (keyA < keyB) return Ordering.Less
      return Ordering.Equal
    })
  }

  min(): Maybe<T> {
    return this.minBy((a, b) => {
      if (a < b) return Ordering.Less
      if (a > b) return Ordering.Greater
      return Ordering.Equal
    })
  }

  minBy(fn: (a: T, b: T) => Ordering): Maybe<T> {
    const it = this.#generator()
    let min = nothing<T>()
    for (const value of it) {
      if (min.isNothing() || fn(value, min.unwrap()) === Ordering.Less) {
        min = just(value)
      }
    }
    return min
  }

  minByKey(fn: (value: T) => Comparable): Maybe<T> {
    return this.minBy((a, b) => {
      const keyA = fn(a)
      const keyB = fn(b)
      if (keyA < keyB) return Ordering.Less
      if (keyA > keyB) return Ordering.Greater
      return Ordering.Equal
    })
  }

  ne(other: Iter<T>): boolean {
    return this.neBy(other, (a, b) => !equal(a, b))
  }

  neBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean {
    if (!isIter(other)) return true
    const it1 = this.#generator()
    const it2 = other.#generator()

    while (true) {
      const { value: val1, done: done1 } = it1.next()
      const { value: val2, done: done2 } = it2.next()

      if (done1 && done2) return false
      if (done1 || done2) return true
      if (fn(val1, val2)) return true
    }
  }

  nth(n: number): Maybe<T> {
    assertNonNegative(n, 'nth')
    assertInteger(n, 'nth')
    const it = this.#generator()
    let i = 0
    while (true) {
      const { value, done } = it.next()
      if (done) return nothing()
      if (i === n) return just(value)
      i++
    }
  }

  reduce<U>(fn: (acc: U, value: T) => U, initial: U): U {
    let acc = initial
    for (const value of this.#generator()) {
      acc = fn(acc, value)
    }
    return acc
  }

  some(fn: (value: T) => boolean): boolean {
    for (const value of this.#generator()) {
      if (fn(value)) return true
    }
    return false
  }

  toArray(): T[] {
    return [...this.#generator()]
  }

  private toJSON(): T[] {
    return this.toArray()
  }

  toMap<K, V>(toEntry: (value: T) => readonly [K, V]): Map<K, V> {
    return new Map(this.map(toEntry))
  }

  toObject<K extends PropertyKey, V>(toEntry: (value: T) => readonly [K, V]): Record<K, V> {
    return Object.fromEntries(this.map(toEntry)) as Record<K, V>
  }

  toSet(): Set<T> {
    return new Set(this)
  }

  toString(): string {
    return `Iter { ${this.join(', ')} }`
  }
  // #endregion

  // #region eager evaluation and return lazy `Iter`
  rev(): Iter<T> {
    const collected = [...this.#generator()]
    return new Iter(function* () {
      for (let i = collected.length - 1; i >= 0; i--) {
        yield collected[i]
      }
    })
  }

  // #endregion

  get [Symbol.toStringTag](): string {
    return 'Iter'
  }

  [Symbol.iterator](): Iterator<T> {
    return this.#generator()
  }
}

/**
 * Creates an `Iter` object from the given value.
 * If no value or `null` is given, returns an empty `Iter`.
 * If the value is an iterable, returns an `Iter` that yields each value from the iterable.
 * If the value is any other type, returns an `Iter` that yields the value once.
 * 
 * @param value - The value to convert to an `Iter`, which may be an iterable, or a single value.
 * @returns An `Iter` object that yields the values from the given value.
 */
export const iter = <T = unknown>(value?: T | Iterable<T> | null): Iter<T> => {
  if (isNullUndefined(value)) return Iter.empty()
  if (isIterable<T>(value)) return Iter.fromIterable(value)
  return Iter.once(value)
}

/**
 * Returns an infinite `Iter` that yields the given value forever.
 * 
 * @param value - The value to repeat, which may be either a function that returns a value, or a value directly..
 * @returns An `Iter` that yields the given value on every iteration.
 */
export const repeat = Iter.repeat

/**
 * Generates a sequence of numbers within a specified range.
 * Panics if the `start` or `end` is not an integer.
 * Panics if the `step` is not a positive integer.
 * 
 * @param {number | RangeConfig} config - The start of the range or a configuration object.
 * @param {number} [end] - The end of the range (exclusive).
 * @param {number} [step] - The step between each number in the range.
 * @returns {Iter<number>} An `Iter` that yields numbers within the specified range.
 */
export function range(): Iter<number>
export function range(start: number): Iter<number>
export function range(start: number, end: number): Iter<number>
export function range(start: number, end: number, step: number): Iter<number>
export function range(config: RangeConfig): Iter<number>
export function range(config: RangeConfig | number = {}, end?: number, step?: number): Iter<number> {
  if (typeof config === 'number') {
    return range({ start: config, end, step })
  }
  const { start = 0, end: endValue = Number.MAX_SAFE_INTEGER, step: s = 1 } = config
  assertInteger(start, 'range')
  assertInteger(endValue, 'range')
  assertInteger(s, 'range')
  assertNonZero(s, 'range')
  assertNonNegative(s, 'range')
  return new Iter(function* () {
    let i = start
    while (i < endValue) {
      yield i
      i += s
    }
  })
}