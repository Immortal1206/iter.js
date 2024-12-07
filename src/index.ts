import { isMaybe, just, nothing, type Maybe } from 'error-null-handle'
import { isIter, isIterable, isNullUndefined } from './utils'

interface IterMethods<T> {
  //#region adapter methods, lazy evaluation
  /**
   * Returns a new iterable that concatenates the current `Iter` with the given iterable.
   * 
   * @param other - The other iterable to concatenate with.
   * @returns A new `Iter` that concatenates the current `Iter` with the given iterable.
   */
  chain(other: Iter<T> | Iterable<T>): Iter<T>
  /**
   * Concatenates the given iterators to this `Iter`.
   * 
   * @param others - The other iterators to concatenate with.
   * @returns A new iterator that concatenates all of the given iterators to this iterator.
   */
  concat(...others: (Iter<T> | Iterable<T>)[]): Iter<T>
  /**
   * Repeats the `Iter` endlessly.
   *
   * @returns A new `Iter` instance that endlessly cycles through the elements of the current `Iter`.
   */
  cycle(): Iter<T>
  /**
   * Creates an `Iter` which gives the current iteration count as well as the value.
   * The iterator returned yields pairs [i, val], where i is the current index of iteration and val is the value returned by the `Iter`.
   *
   * @returns An `Iter` that enumerates the elements of the current `Iter`.
   */
  enumerate(): Iter<[number, T]>
  /**
   * Filters the values in the current `Iter` using the provided predicate function.
   * 
   * @param fn A predicate function that takes a value of type `T` and returns a boolean.
   * @returns A new `Iter` instance containing only the values where the predicate function returns true.
   */
  filter(fn: (value: T) => boolean): Iter<T>
  /**
   * Filter and map the values in the current `Iter` using the provided function.
   * The filter function takes a value of type `T` and returns a value of type `U | undefined | null | Maybe<U>`.
   * The resulting iterator will only contain the values where the filter function returns a non-`null`/`undefined` value.
   * If the filter function returns a `Maybe`, the resulting iterator will only contain the values where the filter function returns a `Just` value.
   * 
   * @param fn A function that takes a value of type `T` and returns a value of type `U | undefined | null | Maybe<U>`.
   * @returns A new `Iter` instance containing the filtered and mapped values.
   */
  filterMap<U>(fn: (value: T) => U | undefined | null | Maybe<U>): Iter<U>
  /**
   * Maps each value of the current `Iter` to an `Iter` using the given function and flattens the result.
   * 
   * @param fn A function that takes a value of type `T` and returns an iterable of type `U`.
   * @returns A new `Iter` instance containing all the values from the iterables returned by the function.
   */
  flatMap<U>(fn: (value: T) => Iter<U> | Iterable<U>): Iter<U>
  /**
   * Flattens nested iterables within the current `Iter`.
   * This method returns a new `Iter` that yields elements from nested iterables in a single, flat sequence.
   *
   * @returns A new `Iter` instance containing all elements from the nested iterables in a flat structure.
   */
  flat(): Iter<T>
  /**
   * Does something with each element of an `Iter`, passing the value on.
   * When using iterators, you’ll often chain several of them together. 
   * While working on such code, you might want to check out what’s happening at various parts in the pipeline.
   * To do that, insert a call to inspect().
   * 
   * It’s more common for inspect() to be used as a debugging tool than to exist in your final code,
   * but applications may find it useful in certain situations when errors need to be logged before being discarded.
   *
   * @param fn - A function that takes a value of type `T` and returns nothing.
   * @returns A new `Iter` that calls the given function on each element.
   */
  inspect(fn: (value: T) => void): Iter<T>
  /**
   * Returns a new `Iter` that intersperses the given value between each of the elements of the current `Iter`.
   * The new `Iter` will yield the first element of the current `Iter`, then the given value,
   * then the second element of the current `Iter`, then the given value again, and so on.
   *
   * @param value - The value to intersperse between each of the elements of the current `Iter`.
   * @returns A new `Iter` that intersperses the given value between each of the elements of the current `Iter`.
   */
  intersperce(value: T): Iter<T>
  /**
   * Creates a new `Iter` by applying the given function to each value in the current `Iter`.
   * 
   * @param fn A function that takes a value of type `T` and returns a value of type `U`.
   * @returns A new `Iter` instance containing the results of applying the given function.
   */
  map<U>(fn: (value: T) => U): Iter<U>
  /**
   * Splits the current `Iter` into two separate `Iter` instances based on the provided predicate function.
   * The first `Iter` contains all elements for which the predicate function returns true,
   * and the second `Iter` contains all elements for which the predicate function returns false.
   *
   * @param fn - A predicate function that takes a value of type `T` and returns a boolean.
   * @returns A tuple containing two `Iter` instances: the first with elements satisfying the predicate,
   * and the second with elements that do not satisfy the predicate.
   */
  partition(fn: (value: T) => boolean): [Iter<T>, Iter<T>]
  /**
   * Similar to reduce, but yields all intermediate results.
   * The function given to this method takes an accumulator and a value from the current `Iter`, 
   * and returns the next accumulator value. 
   * If the function returns null or undefined, the iteration stops.
   * If the function returns a `Maybe` that is a `Nothing`, the iteration also stops.
   *
   * @param fn - A function that takes an accumulator and a value of type `T`, and returns a value of type `U | null | undefined | Maybe<U>`.
   * @param initial - The initial accumulator value.
   * @returns A new `Iter` instance that yields the intermediate results of the given function.
   */
  scan<U>(fn: (acc: U, value: T) => U | null | undefined | Maybe<U>, initial: U): Iter<U>
  /**
   * Skips the first `n` elements of the `Iter` and returns a new `Iter` starting from the (n+1)th element.
   *
   * @param n - The number of elements to skip.
   * @returns A new `Iter` that starts after the first `n` elements.
   */
  skip(n: number): Iter<T>
  /**
   * Skips elements in the `Iter` until the given function returns false.
   * After the first false result, the rest of the elements are yielded.
   *
   * @param shouldSkip A function that takes a value of type `T` and returns a boolean.
   * @returns A new `Iter` that skips elements until the given function returns false, then yields the rest of the elements.
   */
  skipWhile(shouldSkip: (value: T) => boolean): Iter<T>
  /**
   * Takes the first `n` values from the current `Iter`.
   * If the current `Iter` is shorter than `n`, the resulting `Iter` will be shorter than `n`.
   * 
   * @param n The number of values to take.
   * @returns A new `Iter` instance containing the first `n` values of the current iterable.
   */
  take(n: number): Iter<T>
  /**
   * Takes elements from the `Iter` as long as the given function returns true.
   * Once the function returns false, the iteration stops.
   *
   * @param shouldTake A function that takes a value of type `T` and returns a boolean.
   * @returns A new `Iter` that yields elements while the given function returns true.
   */
  takeWhile(shouldTake: (value: T) => boolean): Iter<T>
  /**
   * Zip this `Iter` with another iterator.
   * This method takes another iterator and returns a new `Iter` that yields tuples of elements from both iterators.
   * The new `Iter` will stop when either iterator stops.
   *
   * @param other - The other iterator to zip with.
   * @returns The new zipped `Iter`.
   */
  zip<U>(other: Iter<U> | Iterable<U>): Iter<[T, U]>
  //#endregion

  //#region consumer methods, eager evaluation
  /**
   * Returns the number of items in the `Iter`.
   * 
   * @returns The number of items in the `Iter`.
   */
  count(): number
  /**
   * Tests if the current `Iter` is equal to the given `Iter`.
   * Two `Iter`s are considered equal if they contain the same elements(tests with `Object.is`) in the same order.
   * 
   * @param other - The other `Iter` to compare with.
   * @returns true if the current `Iter` is equal to the given `Iter`, false otherwise.
   */
  eq(other: Iter<T>): boolean
  /**
   * Tests if the current `Iter` is equal to the given `Iter` according to the given equality function.
   * Two `Iter`s are considered equal if they contain the same elements in the same order.
   * The equality function takes two values of type `T` and returns a boolean.
   * 
   * @param other - The other `Iter` to compare with.
   * @param fn - The equality function to use.
   * @returns true if the current `Iter` is equal to the given `Iter` according to the given equality function,
   * false otherwise.
   */
  eqBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean
  /**
   * Checks if every element of the `Iter` satisfies the given predicate.
   *
   * @param fn - A function that takes a value of type `T` and returns a boolean.
   * @returns `true` if every element of the `Iter` satisfies the predicate.
   */
  every(fn: (value: T) => boolean): boolean
  /**
   * Returns the first value wrapped in `Just<T>` in the `Iter` for which the given predicate function returns true.
   * If no element satisfies the predicate, returns `Nothing`.
   *
   * @param fn - A predicate function that takes a value of type `T` and returns a boolean.
   * @returns The first value wrapped in `Just<T>` in the `Iter` for which the predicate function returns true,
   * or `Nothing` if no such value exists.
   */
  find(fn: (value: T) => boolean): Maybe<T>
  /**
   * Returns the index of the first element wrapped in `Just<number>` in the `Iter` that satisfies the given predicate function.
   * If no element satisfies the predicate, returns `Nothing`.
   *
   * @param fn - A function that takes a value of type `T` and returns a boolean.
   * @returns The index of the first element that satisfies the predicate, if any, or `Nothing` if no element satisfies the predicate.
   */
  findIndex(fn: (value: T) => boolean): Maybe<number>
  /**
   * Executes the given function once for each element in the `Iter`.
   * 
   * @param fn A function that takes a value of type `T` and returns nothing.
   */
  each(fn: (value: T) => void): void
  /**
   * Returns the last value in the `Iter`, wrapped in `Just<T>`.
   * If the `Iter` is empty, returns `Nothing`.
   *
   * @returns The last value in the `Iter` wrapped in `Just<T>`, or `Nothing` if the `Iter` is empty.
   */
  last(): Maybe<T>
  /**
   * Returns the nth element of the `Iter`, if it exists.
   *
   * @param n - The zero-based index of the element to retrieve.
   * @returns The nth element wrapped in `Just<T>` if it exists, or `Nothing` if the index is out of bounds.
   */
  nth(n: number): Maybe<T>
  /**
   * Checks if any element of the `Iter` satisfies the given predicate function.
   * 
   * @param fn - A function that takes a value of type `T` and returns a boolean.
   * @returns true if any element of the `Iter` satisfies `fn`, false otherwise.
   */
  some(fn: (value: T) => boolean): boolean
  /**
   * Reduces the `Iter` to a single value using the provided reducer function and an initial accumulator value.
   *
   * @param fn - A reducer function that takes an accumulator and a value, and returning a new accumulator.
   * @param initial - The initial value of the accumulator.
   * @returns The final accumulated value.
   */
  reduce<U>(fn: (acc: U, value: T) => U, initial: U): U
  /**
   * Returns an array containing all elements of the `Iter`.
   * 
   * @returns An array containing all elements of the `Iter`.
   */
  toArray(): T[]
  //#endregion

  /**
   * Reverses an `Iter`'s direction.
   * Usually, `Iter`s iterate from left to right. After using rev(), an `Iter` will instead iterate from right to left.
   * This is only possible if the `Iter` has an end.
   *
   * @returns A reversed `Iter` instance.
   */
  rev(): Iter<T>
}

export class Iter<T> implements IterMethods<T> {
  #generator: () => Generator<T>

  constructor(generator: () => Generator<T>) {
    this.#generator = generator
  }

  static fromIterable<T>(iterable: Iterable<T>): Iter<T> {
    return new Iter(function* () {
      for (const item of iterable) {
        yield item
      }
    })
  }

  static repeat<T>(value: T | (() => T)): Iter<T> {
    const isFn = typeof value === 'function'
    return new Iter(function* () {
      while (true) {
        yield isFn ? (value as () => T)() : value
      }
    })
  }

  // #region adapter methods
  chain(other: Iter<T> | Iterable<T>): Iter<T> {
    const gen1 = this.#generator
    const gen2 = isIter(other) ? other.#generator : () => other
    return new Iter(function* () {
      for (const value of gen1()) {
        yield value
      }
      for (const value of gen2()) {
        yield value
      }
    })
  }

  concat(...others: (Iter<T> | Iterable<T>)[]): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        yield value
      }
      for (const other of others) {
        if (isIter(other)) yield* other.#generator()
        else yield* other
      }
    })
  }

  cycle(): Iter<T> {
    const gen = this.#generator
    return new Iter(function* () {
      while (true) {
        for (const value of gen()) {
          yield value
        }
      }
    })
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

  flat(): Iter<T> {
    const gen = this.#generator
    function* flatten(iterable: Iterable<T> | Iter<T>): Generator<T> {
      const gen = isIter(iterable) ? iterable.#generator() : iterable
      for (const value of gen) {
        if (isIterable<T>(value)) yield* flatten(value)
        else yield value
      }
    }

    return new Iter(() => flatten(gen()))
  }

  flatMap<U>(fn: (value: T) => Iter<U> | Iterable<U>): Iter<U> {
    const gen = this.#generator
    return new Iter(function* () {
      for (const value of gen()) {
        const result = fn(value)
        if (isIter(result)) yield* result.#generator()
        else yield* result
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

  intersperce(value: T): Iter<T> {
    const gen = this.#generator()
    return new Iter(function* () {
      let isFirst = true
      for (const item of gen) {
        if (!isFirst) {
          yield value
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
    const gen = this.#generator
    let i = 0
    return new Iter(function* () {
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
    let skipped = false
    return new Iter(function* () {
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

  take(n: number): Iter<T> {
    const gen = this.#generator()
    return new Iter(function* () {
      for (let i = 0; i < n; i++) {
        const { value, done } = gen.next()
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

  zip<U>(other: Iter<U> | Iterable<U>): Iter<[T, U]> {
    const iter1 = this.#generator()
    const iter2 = isIter(other) ? other.#generator() : other[Symbol.iterator]()

    return new Iter(function* () {
      while (true) {
        const { value: val1, done: done1 } = iter1.next()
        const { value: val2, done: done2 } = iter2.next()

        if (done1 || done2) break

        yield [val1, val2] as [T, U]
      }
    }) as Iter<[T, U]>
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

  eq(other: Iter<T>): boolean {
    return this.eqBy(other, Object.is)
  }

  eqBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean {
    const iter1 = this.#generator()
    const iter2 = other.#generator()

    while (true) {
      const { value: val1, done: done1 } = iter1.next()
      const { value: val2, done: done2 } = iter2.next()

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
    const iter = this.#generator()
    let i = 0
    while (true) {
      const { value, done } = iter.next()
      if (done) return nothing()
      if (fn(value)) return just(i)
      i++
    }
  }

  each(fn: (value: T) => void): void {
    for (const value of this.#generator()) {
      fn(value)
    }
  }

  last(): Maybe<T> {
    const iter = this.#generator()
    let res = nothing<T>()
    while (true) {
      const { value, done } = iter.next()
      if (done) return res
      res = just(value)
    }
  }

  nth(n: number): Maybe<T> {
    const iter = this.#generator()
    let i = 0
    while (true) {
      const { value, done } = iter.next()
      if (done) return nothing()
      if (i === n) return just(value)
      i++
    }
  }

  some(fn: (value: T) => boolean): boolean {
    for (const value of this.#generator()) {
      if (fn(value)) return true
    }
    return false
  }

  reduce<U>(fn: (acc: U, value: T) => U, initial: U): U {
    let acc = initial
    for (const value of this.#generator()) {
      acc = fn(acc, value)
    }
    return acc
  }

  toArray(): T[] {
    return [...this.#generator()]
  }
  // #endregion

  rev(): Iter<T> {
    const collected = [...this.#generator()]
    return new Iter(function* () {
      for (let i = collected.length - 1; i >= 0; i--) {
        yield collected[i]
      }
    })
  }

  private [Symbol.toStringTag](): string {
    return 'Iter'
  }

  [Symbol.iterator](): Iterator<T> {
    return this.#generator()
  }
}

/**
 * Creates a new `Iter` instance from a given iterable.
 *
 * @param iterable - An iterable object whose elements will be used to create the `Iter`.
 * @returns A new `Iter` instance containing all elements from the given iterable.
 */
export const iter = Iter.fromIterable

/**
 * Returns an infinite `Iter` that yields the given value forever.
 * @param value - The value to repeat, which may be either a function that returns a value, or a value directly..
 * @returns An `Iter` that yields the given value on every iteration.
 */
export const repeat = Iter.repeat

export {
  isIter,
}

export default iter