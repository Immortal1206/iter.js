import { isMaybe, just, nothing, type Maybe } from 'error-null-handle'

import {
  assertInteger,
  assertNonNegative,
  assertNonZero,
  isFunction,
  isIterable,
  isNullUndefined
} from './utils'
import type { IterMethods } from './@types/iter'

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
    return new Iter(function* () { })
  }

  static once<T>(value: T): Iter<T> {
    return new Iter(function* () {
      yield value
    })
  }

  // #region adapter methods
  append(item: T): Iter<T> {
    const it1 = this.#generator()
    return new Iter(function* () {
      yield* it1
      yield item
    })
  }

  chain(other: Iterable<T>): Iter<T> {
    const it1 = this.#generator()
    return new Iter(function* () {
      yield* it1
      yield* other
    })
  }

  chunks(size: number): Iter<Iter<T>> {
    assertNonNegative(size, 'chunks')
    assertInteger(size, 'chunks')
    assertNonZero(size, 'chunks')
    const it = this.#generator()
    return new Iter(function* () {
      let chunk = Iter.empty<T>()
      let len = 0
      for (const value of it) {
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

  concat(...others: Iterable<T>[]): Iter<T> {
    const it = this.#generator()
    return new Iter(function* () {
      yield* it
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

  enumerate(): Iter<[number, T]> {
    const it = this.#generator()
    return new Iter(function* () {
      let i = 0
      for (const value of it) {
        yield [i, value]
        i++
      }
    }) as Iter<[number, T]>
  }

  filter(fn: (value: T) => boolean): Iter<T> {
    const it = this.#generator()
    return new Iter(function* () {
      for (const value of it) {
        if (fn(value)) {
          yield value
        }
      }
    })
  }

  filterMap<U>(fn: (value: T) => U | undefined | null | Maybe<U>): Iter<U> {
    const it = this.#generator()
    return new Iter(function* () {
      for (const value of it) {
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

  flat(): Iter<T> {
    const it = this.#generator()
    function* flatten(iterable: Iterable<T>): Generator<T> {
      for (const value of iterable) {
        if (isIterable<T>(value)) yield* flatten(value)
        else yield value
      }
    }

    return new Iter(() => flatten(it))
  }

  flatMap<U>(fn: (value: T) => Iterable<U>): Iter<U> {
    const it = this.#generator()
    return new Iter(function* () {
      for (const value of it) {
        const result = fn(value)
        yield* result
      }
    })
  }

  inspect(fn: (value: T) => void): Iter<T> {
    const it = this.#generator()
    return new Iter(function* () {
      for (const value of it) {
        fn(value)
        yield value
      }
    })
  }

  interleave(other: Iterable<T>): Iter<T> {
    const it1 = this.#generator()
    const it2 = other[Symbol.iterator]()
    return new Iter(function* () {
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
    const it1 = this.#generator()
    const it2 = other[Symbol.iterator]()
    return new Iter(function* () {
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
    const it = this.#generator()
    const isFn = isFunction(value)
    return new Iter(function* () {
      let isFirst = true
      for (const item of it) {
        if (!isFirst) {
          yield isFn ? value() : value
        }
        yield item
        isFirst = false
      }
    })
  }

  map<U>(fn: (value: T) => U): Iter<U> {
    const it = this.#generator()
    return new Iter(function* () {
      for (const value of it) {
        yield fn(value)
      }
    })
  }

  merge(other: Iterable<T>): Iter<T> {
    const it1 = this.#generator()
    const it2 = other[Symbol.iterator]()
    return new Iter(function* () {
      let value1 = it1.next()
      let value2 = it2.next()
      while (!value1.done && !value2.done) {
        if (value1.value <= value2.value) {
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

  mergeBy(other: Iterable<T>, isFirst: (a: T, b: T) => boolean): Iter<T> {
    const it1 = this.#generator()
    const it2 = other[Symbol.iterator]()
    return new Iter(function* () {
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
    const it = this.#generator()
    return new Iter(function* () {
      yield item
      yield* it
    })
  }

  scan<U>(fn: (acc: U, value: T) => U | null | undefined | Maybe<U>, initial: U): Iter<U> {
    const it = this.#generator()
    return new Iter(function* () {
      let acc = initial
      for (const value of it) {
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
    const it = this.#generator()
    let i = 0
    return new Iter(function* () {
      for (const value of it) {
        if (i < n) {
          i++
          continue
        }
        yield value
      }
    })
  }

  skipWhile(shouldSkip: (value: T) => boolean): Iter<T> {
    const it = this.#generator()
    let skipped = false
    return new Iter(function* () {
      for (const value of it) {
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
    const it = this.#generator()
    return new Iter(function* () {
      let i = 0
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

  take(n: number): Iter<T> {
    assertNonNegative(n, 'take')
    assertInteger(n, 'take')
    const it = this.#generator()
    return new Iter(function* () {
      for (let i = 0; i < n; i++) {
        const { value, done } = it.next()
        if (done) break
        yield value
      }
    })
  }

  takeWhile(shouldTake: (value: T) => boolean): Iter<T> {
    const it = this.#generator()
    return new Iter(function* () {
      for (const value of it) {
        if (shouldTake(value)) {
          yield value
        } else {
          break
        }
      }
    })
  }

  unique(): Iter<T> {
    const it = this.#generator()
    const seen = new Set<T>()
    return new Iter(function* () {
      for (const value of it) {
        if (seen.has(value)) continue
        seen.add(value)
        yield value
      }
    })
  }

  uniqueBy<V>(fn: (value: T) => V): Iter<T> {
    const it = this.#generator()
    const seen = new Set<V>()

    return new Iter(function* () {
      for (const value of it) {
        const key = fn(value)
        if (seen.has(key)) continue
        seen.add(key)
        yield value
      }
    })
  }

  zip<U>(other: Iterable<U>): Iter<[T, U]> {
    const it1 = this.#generator()
    const it2 = other[Symbol.iterator]()

    return new Iter(function* () {
      while (true) {
        const { value: val1, done: done1 } = it1.next()
        const { value: val2, done: done2 } = it2.next()

        if (done1 || done2) break

        yield [val1, val2] as [T, U]
      }
    }) as Iter<[T, U]>
  }

  zipWith<V, U = unknown>(other: Iterable<U>, fn: (a: T, b: U) => V): Iter<V> {
    const it1 = this.#generator()
    const it2 = other[Symbol.iterator]()

    return new Iter(function* () {
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
    return this.eqBy(other, Object.is)
  }

  eqBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean {
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

  groupToMap<K>(keySelector: (value: T) => K): Map<K, Iter<T>> {
    return this.reduce((acc, value) => {
      const key = keySelector(value)
      if (acc.has(key)) {
        acc.set(key, acc.get(key)!.append(value))
      } else {
        acc.set(key, Iter.once(value))
      }
      return acc
    }, new Map<K, Iter<T>>())
  }

  groupToObject<K extends PropertyKey>(keySelector: (value: T) => K): Record<K, Iter<T>> {
    return this.reduce((acc, value) => {
      const key = keySelector(value)
      if (acc[key]) {
        acc[key] = acc[key].append(value)
      } else {
        acc[key] = Iter.once(value)
      }
      return acc
    }, {} as Record<K, Iter<T>>)
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

  ne(other: Iter<T>): boolean {
    return this.neBy(other, (a, b) => !Object.is(a, b))
  }

  neBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean {
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
    return Array.from(this)
  }

  toMap<K, V>(toEntry: (value: T) => [K, V]): Map<K, V> {
    return new Map(this.map(toEntry))
  }

  toObject<K extends PropertyKey, V>(toEntry: (value: T) => [K, V]): Record<K, V> {
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

  private [Symbol.toStringTag](): string {
    return 'Iter'
  }

  [Symbol.iterator](): Iterator<T> {
    return this.#generator()
  }
}

/**
 * Creates an `Iter` object from the given value.
 * If no value is given, returns an empty `Iter`.
 * If the value is an iterable, returns an `Iter` that yields each value from the iterable.
 * If the value is any other type, returns an `Iter` that yields the value once.
 * 
 * @param value - The value to convert to an `Iter`, which may be an iterable, or a single value.
 * @returns An `Iter` object that yields the values from the given value.
 */
export const iter = <T = unknown>(value?: T | Iterable<T>): Iter<T> => {
  if (value === undefined) return Iter.empty()
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

