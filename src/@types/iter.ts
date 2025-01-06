import type { Maybe } from 'error-null-handle'

import type { Iter } from '../iter'

export interface IterMethods<T> {
  //#region adapter methods, lazy evaluation
  /**
   * Append a single element to the end of an `Iter`.
   * 
   * @param item - The element to append.
   * @returns A new `Iter` with the given element appended.
   */
  append(item: T): Iter<T>
  /**
   * Returns a new iterable that concatenates the current `Iter` with the given iterable.
   * 
   * @param other - The other iterable to concatenate with.
   * @returns A new `Iter` that concatenates the current `Iter` with the given iterable.
   */
  chain(other: Iterable<T>): Iter<T>
  /**
   * Split an `Iter` into chunks of the given size.
   * Panics if `size` is not a positive integer.
   *
   * @param size The size of each chunk.
   * @returns An `Iter` of `Iter`s, each containing `size` elements of the original `Iter`.
   */
  chunks(size: number): Iter<Iter<T>>
  /**
   * Concatenates the given iterators to this `Iter`.
   * 
   * @param others - The other iterators to concatenate with.
   * @returns A new iterator that concatenates all of the given iterators to this iterator.
   */
  concat(...others: Iterable<T>[]): Iter<T>
  /**
   * Repeats the `Iter` endlessly.
   *
   * @returns A new `Iter` instance that endlessly cycles through the elements of the current `Iter`.
   */
  cycle(): Iter<T>
  /**
   * Removes all but the first of consecutive duplicate elements in the `Iter`.
   * Duplicates are detected using deep equality.
   *
   * @returns A new `Iter` that yields only the first occurrence of each consecutive duplicate value.
   */
  dedup(): Iter<T>
  /**
    * Removes all but the first of consecutive elements in the `Iter` satisfying a given equality relation.
    * Consecutive elements `a` and `b` are considered duplicates if `sameBucket(a, b)` returns true.
    * 
    * @param sameBucket - A function that takes two elements of type `T` and returns true if they are to be considered duplicates.
    * @returns A new `Iter` that yields only the first occurrence of each value, based on the result of the given function.
    */
  dedupBy(sameBucket: (a: T, b: T) => boolean): Iter<T>
  /**
   * Removes all but the first of consecutive elements in the iterator based on a key derived from each element.
   * Consecutive elements are considered duplicates if they map to the same key (tests with `Object.is`).
   *
   * @param getKey - A function that takes a value of type `T` and returns a key of type `K`.
   * @returns A new `Iter` that yields only the first occurrence of each value, based on the key derived by the given function.
   */
  dedupByKey<K>(getKey: (value: T) => K): Iter<T>
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
  flatMap<U>(fn: (value: T) => Iterable<U>): Iter<U>
  /**
   * Flattens an iterable to a specified depth.
   * Panics if the depth is not a positive integer.
   *
   * @param depth - The depth to flatten to, default 1.
   * @returns A new `Iter` instance with the flattened iterable.
   * @throws {Error} - If the depth is not a positive integer.
   */
  flat<D extends number = 1>(depth?: D): FlattedIter<T, D>
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
   * Alternate elements from two iterators until both have run out.
   * 
   * @param other - The other iterator to interleave with.
   * @returns A new `Iter` that interleaves the elements of the current `Iter` and the given iterator.
   */
  interleave(other: Iterable<T>): Iter<T>
  /**
   * Alternate elements from two iterators until at least one of them has run out.
   * 
   * @param other - The other iterator to interleave with.
   * @returns A new `Iter` that interleaves the elements of the current `Iter` and the given iterator.
   */
  interleaveShortest(other: Iterable<T>): Iter<T>
  /**
   * Returns a new `Iter` that intersperses the given value between each of the elements of the current `Iter`.
   * The new `Iter` will yield the first element of the current `Iter`, then the given value,
   * then the second element of the current `Iter`, then the given value again, and so on.
   * The given value can be a function that returns a value,
   * in which case the value returned by the function will be used as the interspersed value.
   *
   * @param value - The value to intersperse between each of the elements of the current `Iter`.
   * @returns A new `Iter` that intersperses the given value between each of the elements of the current `Iter`.
   */
  intersperse(value: T | (() => T)): Iter<T>
  /**
   * Creates a new `Iter` by applying the given function to each value in the current `Iter`.
   * 
   * @param fn A function that takes a value of type `T` and returns a value of type `U`.
   * @returns A new `Iter` instance containing the results of applying the given function.
   */
  map<U>(fn: (value: T) => U): Iter<U>
  /**
   * Merge the current `Iter` with the given iterable.
   * The merged iterator will yield elements in ascending order.
   * If two elements are equal, the first element from the current `Iter` will come first.
   * If both base iterators are sorted (ascending), the result is sorted.
   * 
   * @param other - The iterable to merge with.
   * @returns A new `Iter` instance that merges the current `Iter` with the given iterable.
   */
  merge(other: Iterable<T>): Iter<T>
  /**
   * Merges the current `Iter` with the given iterable using the provided `isFirst` function.
   * The `isFirst` function takes two values, first from the current `Iter` and second from the given iterable,
   * and returns true if the first value should be yielded before the second value.
   * 
   * @param other - The iterable to merge with.
   * @param isFirst - A function that takes two values and returns true if the first value should be yielded before the second value.
   * @returns A new `Iter` instance that merges the current `Iter` with the given iterable.
   */
  mergeBy(other: Iterable<T>, isFirst: (a: T, b: T) => boolean): Iter<T>
  /**
   * Merges the current `Iter` with the given iterable using the given function to extract a key from each element.
   * The elements are merged in ascending order of their keys.
   *
   * @param other the iterable to merge with
   * @param getKey the function to extract a key from each element
   * @returns a new `Iter` that is the result of merging the two iterables
   */
  mergeByKey<K>(other: Iterable<T>, getKey: (value: T) => K): Iter<T>
  /**
   * Prepends a single element to the beginning of the `Iter`.
   * 
   * @param item The element to prepend.
   * @returns A new `Iter` with the given element prepended.
   */
  prepend(item: T): Iter<T>
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
   * Panics if `n` is not a natural integer.
   *
   * @param n - The number of elements to skip.
   * @returns A new `Iter` that starts after the first `n` elements.
   * @throws {Error} - If `n` is not a natural integer.
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
   * Returns a new `Iter` that yields the elements of the current `Iter` in the given range.
   * The range is inclusive at the start and exclusive at the end.
   * Panics if the start index is greater than the end index.
   * Panics if the start or end index is not a natural integer.
   * 
   * @param start - The start index of the range, inclusive.
   * @param end - The end index of the range, exclusive.
   * @returns A new `Iter` that yields the elements in the given range.
   * @throws {Error} - If the start index is greater than the end index.
   * @throws {Error} - If the start or end index is not a natural integer.
   */
  slice(start: number, end: number): Iter<T>
  /**
   * Creates an `Iter` starting at the start point, but stepping by the given amount at each iteration.
   * Note the first element of the iterator will always be returned, regardless of the step given.
   * Panics if the step amount is not a positive integer.
   * 
   * @param step - The step amount to use.
   * @returns A new `Iter` that steps by the given amount.
   * @throws {Error} - If the step amount is not a positive integer.
   */
  stepBy(step: number): Iter<T>
  /**
   * Takes the first `n` values from the current `Iter`.
   * If the current `Iter` is shorter than `n`, the resulting `Iter` will be shorter than `n`.
   * Panics if `n` is not a natural integer.
   * 
   * @param n The number of values to take.
   * @returns A new `Iter` instance containing the first `n` values of the current iterable.
   * @throws {Error} - If `n` is not a natural integer.
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
   * Return an `Iter` that filters out elements that have already been produced once during the iteration.
   * Duplicates are detected by comparing the elements by value and reference.
   * The values are stored in a set in the iterator.
   * The `Iter` is stable, returning the non-duplicate items in the order in which they occur in the adapted `Iter`.
   * In a set of duplicate items, the first item encountered is the item retained.
   *
   * @returns A new iterator that yields only the first occurrence of each value.
   */
  unique(): Iter<T>
  /**
   * Return an `Iter` that filters out elements that have already been produced once during the iteration.
   * Duplicates are detected by comparing the key they map to with the keying function `fn` by hash and equality.
   * The keys are stored in a hash set in the iterator.
   * The `Iter` is stable, returning the non-duplicate items in the order in which they occur in the adapted `Iter`.
   * In a set of duplicate items, the first item encountered is the item retained.
   *
   * @param fn - A function that takes a value of type `T` and returns the key of each element.
   * @returns A new iterator that yields only the first occurrence of each value, based on the result of the given function.
   */
  uniqueByKey<K>(fn: (value: T) => K): Iter<T>
  /**
   * Zip this `Iter` with another iterator.
   * This method takes another iterator and returns a new `Iter` that yields tuples of elements from both iterators.
   * The new `Iter` will stop when either iterator stops.
   *
   * @param other - The other iterator to zip with.
   * @returns The new zipped `Iter`.
   */
  zip<U>(other: Iterable<U>): Iter<[T, U]>
  /**
   * Creates a new `Iter` that pairs each element of the current `Iter` with the corresponding element of another `Iter`,
   * and applies a function to each pair, yielding the results.
   * The new `Iter` will stop when either iterator stops.
   *
   * @param other The other `Iter` to zip with.
   * @param fn The function to apply to each pair of elements.
   * @returns A new `Iter` with the zipped values.
   */
  zipWith<V, U = unknown>(other: Iter<U>, fn: (a: T, b: U) => V): Iter<V>
  //#endregion

  //#region consumer methods, eager evaluation
  /**
   * Returns the number of items in the `Iter`.
   * 
   * @returns The number of items in the `Iter`.
   */
  count(): number
  /**
   * Executes the given function once for each element in the `Iter`.
   * 
   * @param fn A function that takes a value of type `T` and returns nothing.
   */
  each(fn: (value: T) => void): void
  /**
   * Tests if the current `Iter` is equal to the given `Iter`.
   * Two `Iter`s are considered equal if they contain the same elements(tests with deep equality) in the same order.
   * 
   * @param other - The other `Iter` to compare with.
   * @returns true if the current `Iter` is equal to the given `Iter`, false otherwise.
   */
  eq(other: Iter<T>): boolean
  /**
   * Tests if the current `Iter` is equal to the given `Iter` according to the given equality function.
   * Two `Iter`s are considered equal if they contain the same elements in the same order.
   * The equality function takes two values of type `T` and returns a boolean that indicates the two values are equal.
   * 
   * @param other - The other `Iter` to compare with.
   * @param fn - The equality function, return true if the two values are equal.
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
   * Reduces the `Iter` to a `Map` where the keys are values returned by the given function,
   * and the values are `Iter`s of the elements that were grouped by the given function.
   * 
   * @param keySelector A function that takes a value of type `T` and returns a key of type `K`.
   * @returns A new `Map` containing the grouped elements.
   */
  groupToMap<K>(keySelector: (value: T) => K): Map<K, Iter<T>>
  /**
   * Reduces the `Iter` to a `Object` where the keys are values returned by the given function,
   * and the values are `Iter`s of the elements that were grouped by the given function.
   * 
   * @param keySelector a function that takes a value of type `T` and returns a value of type `K`
   * @returns an object where each key is a value of type `K` and each value is an `Iter` of type `Iter<T>`
   */
  groupToObject<K extends PropertyKey>(keySelector: (value: T) => K): Record<K, Iter<T>>
  /**
   * Tests if the current `Iter` contains non duplicate elements.
   * Duplicates are detected by by hash and equality.
   * 
   * @returns `true` if the `Iter` contains unique elements, `false` otherwise.
   */
  isUnique(): boolean
  /**
   * Tests if the current `Iter` contains non duplicate elements according to the given keying function.
   * Duplicates are detected by comparing the key they map to with the keying function `fn` by hash and equality.
   * The keys are stored in a `Set` in the iterator.
   *
   * @param fn - A function that takes a value of type `T` and returns the key of each element.
   * @returns `true` if the `Iter` contains unique elements, `false` otherwise.
   */
  isUniqueByKey<K>(fn: (value: T) => K): boolean
  /**
   * Join all elements of the `Iter` into a single string, separated by the given separator.
   * 
   * @param sep The separator to use when joining the elements.
   * @returns The joined string.
   */
  join(sep: string): string
  /**
   * Returns the last value in the `Iter`, wrapped in `Just<T>`.
   * If the `Iter` is empty, returns `Nothing`.
   *
   * @returns The last value in the `Iter` wrapped in `Just<T>`, or `Nothing` if the `Iter` is empty.
   */
  last(): Maybe<T>
  /**
   * Checks if the current `Iter` is not equal to the given `Iter`.
   * Two `Iter`s are considered not equal if they contain different elements (tests with deep equality) in the same order,
   * or if they have different lengths.
   * 
   * @param other - The other `Iter` to check against.
   * @returns `true` if the current `Iter` is not equal to the given `Iter`, `false` otherwise.
   */
  ne(other: Iter<T>): boolean
  /**
   * Tests if the current `Iter` is not equal to the given `Iter` using the given comparison function.
   * Two `Iter`s are considered not equal if they contain the different elements in the same order,
   * or if they have different lengths.
   * The comparison function takes two values of type `T` and
   * returns a boolean that indicates the two values are not equal.
   * 
   * @param other - The other `Iter` to test against.
   * @param fn - The comparison function, return true if the two values are not equal.
   * @returns `true` if the two `Iter`s are not equal, `false` otherwise.
   */
  neBy(other: Iter<T>, fn: (a: T, b: T) => boolean): boolean
  /**
   * Returns the nth element of the `Iter`, if it exists.
   * The index is zero-based.
   * Panics if the index is not a natural integer.
   *
   * @param n - The zero-based index of the element to retrieve.
   * @returns The nth element wrapped in `Just<T>` if it exists, or `Nothing` if the index is out of bounds.
   * @throws {Error} - If the index is not a natural integer.
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
  /**
   * Converts an `Iter` to a `Map`.
   * The provided function `toEntry` takes a value of type `T` and returns a tuple of type `[K, V]`.
   * The resulting `Map` will have the resulting keys of type `K` and the resulting values of type `V`.
   * @param toEntry A function that takes a value of type `T` and returns a tuple of type `[K, V]`.
   * @returns A `Map` containing the entries from the `Iter` converted using the given function.
   */
  toMap<K, V>(toEntry: (value: T) => [K, V]): Map<K, V>
  /**
   * Returns a new object, mapping each element of the `Iter` to its corresponding entry in the object.
   * The provided function `toEntry` takes a value of type `T` and returns a tuple of type `[K, V]`.
   * The resulting `Object` will have the resulting keys of type `K` and the resulting values of type `V`.
   * @param toEntry A function that takes a value of type `T` and returns a tuple of type `[K, V]`.
   * @returns An object containing the entries from the `Iter` converted using the given function.
   */
  toObject<K extends PropertyKey, V>(toEntry: (value: T) => [K, V]): Record<K, V>
  /**
   * Converts the `Iter` to a `Set`.
   * Note that the order of the elements in the resulting `Set` is not guaranteed
   * to be the same as the order of elements in the original `Iter`,
   * because the `Iter` might contain duplicates.
   *
   * @returns A `Set` containing all elements of the `Iter`.
   */
  toSet(): Set<T>
  /**
   * Returns a string representation of the `Iter`.
   */
  toString(): string
  //#endregion

  //#region eager evaluate values and return lazy `Iter`
  /**
   * Reverses an `Iter`'s direction.
   * Usually, `Iter`s iterate from left to right. After using rev(), an `Iter` will instead iterate from right to left.
   * This is only possible if the `Iter` has an end.
   *
   * @returns A reversed `Iter` instance.
   */
  rev(): Iter<T>
  //#endregion

  get [Symbol.toStringTag](): string

  [Symbol.iterator](): Iterator<T>
}

export type FlatIterable<T, Depth extends number> = {
  done: T
  recur: T extends Iterable<infer I>
  ? FlatIterable<I, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
  : T
}[Depth extends 0 ? 'done' : /* Depth extends -1 ? 'done' : */ 'recur']
export type FlattedIter<T, Depth extends number> = Iter<FlatIterable<T, Depth>> 