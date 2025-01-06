# immutable iterator that supports lazy evaluation and chain methods

for more infomation about `Maybe`, `Just` and `Nothing`, see [error-null-handle](https://github.com/Immortal1206/error-null-handle)

### install

```shell
npm install lazy-iter.js
```

## API reference

  * <a href="#append">append</a>
  * <a href="#chain">chain</a>
  * <a href="#chunks">chunks</a>
  * <a href="#concat">concat</a>
  * <a href="#count">count</a>
  * <a href="#cycle">cycle</a>
  * <a href="#dedup">dedup</a>
  * <a href="#dedupBy">dedupBy</a>
  * <a href="#dedupByKey">dedupByKey</a>
  * <a href="#each">each</a>
  * <a href="#enumerate">enumerate</a>
  * <a href="#eq">eq</a>
  * <a href="#eqBy">eqBy</a>
  * <a href="#every">every</a>
  * <a href="#filter">filter</a>
  * <a href="#filterMap">filterMap</a>
  * <a href="#flatMap">flatMap</a>
  * <a href="#flat">flat</a>
  * <a href="#find">find</a>
  * <a href="#findIndex">findIndex</a>
  * <a href="#groupToMap">groupToMap</a>
  * <a href="#groupToObject">groupToObject</a>
  * <a href="#interleave">interleave</a>
  * <a href="#interleaveShortest">interleaveShortest</a>
  * <a href="#inspect">inspect</a>
  * <a href="#intersperse">intersperse</a>
  * <a href="#isIter">isIter</a>
  * <a href="#isUnique">isUnique</a>
  * <a href="#isUniqueByKey">isUniqueByKey</a>
  * <a href="#iter">iter</a>
  * <a href="#join">join</a>
  * <a href="#last">last</a>
  * <a href="#map">map</a>
  * <a href="#merge">merge</a>
  * <a href="#mergeBy">mergeBy</a>
  * <a href="#mergeByKey">mergeByKey</a>
  * <a href="#ne">ne</a>
  * <a href="#neBy">neBy</a>
  * <a href="#nth">nth</a>
  * <a href="#partition">partition</a>
  * <a href="#prepend">prepend</a>
  * <a href="#range">range</a>
  * <a href="#reduce">reduce</a>
  * <a href="#repeat">repeat</a>
  * <a href="#rev">rev</a>
  * <a href="#scan">scan</a>
  * <a href="#skip">skip</a>
  * <a href="#skipWhile">skipWhile</a>
  * <a href="#slice">slice</a>
  * <a href="#some">some</a>
  * <a href="#stepBy">stepBy</a>
  * <a href="#take">take</a>
  * <a href="#takeWhile">takeWhile</a>
  * <a href="#toArray">toArray</a>
  * <a href="#toMap">toMap</a>
  * <a href="#toObject">toObject</a>
  * <a href="#toSet">toSet</a>
  * <a href="#toString">toString</a>
  * <a href="#unique">unique</a>
  * <a href="#uniqueByKey">uniqueByKey</a>
  * <a href="#zip">zip</a>
  * <a href="#zipWith">zipWith</a>

### API to create `Iter` instance

* <span id="iter">iter</span> :: \<T>(iterable: Iterable\<T>) => Iter\<T>

  Creates an `Iter` object from the given value.<br>
  If no value or `null` is given, returns an empty `Iter`.<br>
  If the value is an iterable, returns an `Iter` that yields each value from the iterable.<br>
  If the value is any other type, returns an `Iter` that yields the value once.

* <span id="repeat">repeat</span> :: \<T>(value: T | (() => T)) => Iter\<T>

  Repeat the given value endlessly.

* <span id="range">range</span> :: (config: RangeConfig | number = {}, end?: number, step?: number) => Iter\<number> 

  Generates a sequence of numbers within a specified range.

### type predicate

* <span id="isIter">isIter</span> :: \<T>(value: unknown) => value is Iter\<T>

  Test if a variable is an `Iter` instance.

### `Iter<T>` instance methods

#### lazy evaluation methods

* <span id="append">append</span> :: (item: T): Iter\<T>

  Append a single element to the end of an `Iter`.

* <span id="chain">chain</span> :: (other: Iterable\<T>) => Iter\<T>

  Concatenates the current `Iter` with the given iterable.

* <span id="chunks">chunks</span> :: (size: number): Iter\<Iter\<T>>

  Split an `Iter` into chunks of the given size.<br>
  Panics if `size` is not a positive integer.

* <span id="concat">concat</span> :: (...others: Iterable\<T>[]) => Iter\<T>

  Concatenates the given iterators to this `Iter`.

* <span id="cycle">cycle</span> :: () => Iter\<T>

  Repeats the `Iter` endlessly.

* <span id="dedup">dedup</span> :: () => Iter\<T>

  Removes all but the first of consecutive duplicate elements in the `Iter`.<br>
  Duplicates are detected using deep equality.

* <span id="dedupBy">dedupBy</span> :: (sameBucket: (a: T, b: T) => boolean) => Iter\<T>

  Removes all but the first of consecutive elements in the `Iter` satisfying a given equality relation.<br>
  Consecutive elements `a` and `b` are considered duplicates if `sameBucket(a, b)` returns true.

* <span id="dedupByKey">dedupByKey</span> :: \<K>(getKey: (value: T) => K) => Iter\<T>

  Removes all but the first of consecutive elements in the iterator based on a key derived from each element.<br>
  Consecutive elements are considered duplicates if they map to the same key (tests with `Object.is`).

* <span id="enumerate">enumerate</span> :: () => Iter<[number, T]>

  Creates an `Iter` which gives the current iteration count as well as the value.

* <span id="filter">filter</span> :: (fn: (value: T) => boolean) => Iter\<T>

  Filters the values in the current `Iter` using the provided predicate function.

* <span id="filterMap">filterMap</span> :: \<U>(fn: (value: T) => U | undefined | null | Maybe\<U>) => Iter\<U>

  Filter and map the values in the current `Iter` using the provided function.<br>
  The filter function takes a value of type `T` and returns a value of type `U | undefined | null | Maybe<U>`.<br>
  The resulting iterator will only contain the values where the filter function returns a non-`null`/`undefined` value.<br>
  If the filter function returns a `Maybe`, the resulting iterator will only contain the values where the filter function returns a `Just` value.<br>

* <span id="flatMap">flatMap</span> :: \<U>(fn: (value: T) => Iterable\<U>) => Iter\<U>

  Maps each value of the current `Iter` to an `Iter` using the given function and flattens the result.

* <span id="flat">flat</span> :: \<D extends number = 1>(depth?: D): FlattedIter\<T, D>

  Flattens an iterable to a specified depth.<br>
  Panics if the depth is not a positive integer.

* <span id="inspect">inspect</span> :: (fn: (value: T) => void) => Iter\<T>

  Does something with each element of an Iter, passing the value on.<br>
  When using iterators, you’ll often chain several of them together.<br>
  While working on such code, you might want to check out what’s happening at various parts in the pipeline.<br>
  To do that, insert a call to inspect(). <br>

  It’s more common for inspect() to be used as a debugging tool than to exist in your final code,<br>
  but applications may find it useful in certain situations when errors need to be logged before being discarded.

* <span id="intersperse">intersperse</span> :: (value: T) => Iter\<T>

  Returns a new `Iter` that intersperses the given value between each of the elements of the current `Iter`.<br>
  The new `Iter` will yield the first element of the current `Iter`, then the given value,<br>
  then the second element of the current `Iter`, then the given value again, and so on.<br>
  The given value can be a function that returns a value,<br>
  in which case the value returned by the function will be used as the interspersed value.

* <span id="map">map</span> :: \<U>(fn: (value: T) => U) => Iter\<U>

  Creates a new `Iter` by applying the given function to each value in the current `Iter`.

* <span id="merge">merge</span> :: (other: Iterable\<T>): Iter\<T>

  Merge the current `Iter` with the given iterable.<br>
  The merged iterator will yield elements in ascending order.<br>
  If two elements are equal, the first element from the current `Iter` will come first.<br>
  If both base iterators are sorted (ascending), the result is sorted.<br>

* <span id="mergeBy">mergeBy</span> :: (other: Iterable\<T>, isFirst: (a: T, b: T) => boolean): Iter\<T>

  Merges the current `Iter` with the given iterable using the provided `isFirst` function.<br>
  The `isFirst` function takes two values, first from the current `Iter` and second from the given iterable,<br>
  and returns true if the first value should be yielded before the second value.<br>

* <span id="mergeByKey">mergeByKey</span> :: \<K>(other: Iterable\<T>, getKey: (value: T) => K): Iter\<T>

  Merges the current `Iter` with the given iterable using the given function to extract a key from each element.<br>
  The elements are merged in ascending order of their keys.

* <span id="partition">partition</span> :: (fn: (value: T) => boolean) => [Iter\<T>, Iter\<T>]

  Splits the current `Iter` into two separate `Iter` instances based on the provided predicate function.<br>
  The first `Iter` contains all elements for which the predicate function returns true,<br>
  and the second `Iter` contains all elements for which the predicate function returns false.<br>

* <span id="prepend">prepend</span> :: (item: T): Iter\<T>

  Prepends a single element to the beginning of the `Iter`.

* <span id="scan">scan</span> :: \<U>(fn: (acc: U, value: T) => U | null | undefined | Maybe\<U>, initial: U) => Iter\<U>

  Similar to reduce, but yields all intermediate results.<br>
  The function given to this method takes an accumulator and a value from the current `Iter`,<br> 
  and returns the next accumulator value.<br>
  If the function returns null or undefined, the iteration stops.<br>
  If the function returns a `Maybe` that is a `Nothing`, the iteration also stops.<br>

* <span id="skip">skip</span> :: (n: number) => Iter\<T>

  Skips the first `n` elements of the `Iter` and returns a new `Iter` starting from the (n+1)th element.<br>
  Panics if `n` is not a natural integer.

* <span id="skipWhile">skipWhile</span> :: (shouldSkip: (value: T) => boolean) => Iter\<T>

  Skips elements in the `Iter` until the given function returns false.<br>
  After the first false result, the rest of the elements are yielded.

* <span id="slice">slice</span> :: (start: number, end: number): Iter\<T>

  Returns a new `Iter` that yields the elements of the current `Iter` in the given range.
  Panics if the start index is greater than the end index.<br>
  Panics if the start or end index is not a natural integer.

* <span id="stepBy">stepBy</span> :: (step: number): Iter\<T>

  Creates an `Iter` starting at the start point, but stepping by the given amount at each iteration.<br>
  Note the first element of the iterator will always be returned, regardless of the step given.<br>
  Panics if the step amount is not a positive integer.

* <span id="take">take</span> :: (n: number) => Iter\<T>

  Takes the first `n` values from the current `Iter`.<br>
  If the current `Iter` is shorter than `n`, the resulting `Iter` will be shorter than `n`.<br>
  Panics if `n` is not a natural integer.

* <span id="takeWhile">takeWhile</span> :: (shouldTake: (value: T) => boolean) => Iter\<T>

  Takes elements from the `Iter` as long as the given function returns true.<br>
  Once the function returns false, the iteration stops.

* <span id="unique">unique</span> :: (): Iter\<T>

  Return an `Iter` that filters out elements that have already been produced once during the iteration.<br>
  Duplicates are detected by comparing the elements by value and reference.<br>
  The values are stored in a set in the iterator.<br>
  The `Iter` is stable, returning the non-duplicate items in the order in which they occur in the adapted `Iter`.<br>
  In a set of duplicate items, the first item encountered is the item retained.<br>

* <span id="uniqueByKey">uniqueByKey</span> :: \<V>(fn: (value: T) => V): Iter\<T>

  Return an `Iter` that filters out elements that have already been produced once during the iteration.<br>
  Duplicates are detected by comparing the key they map to with the keying function `fn` by hash and equality.<br>
  The keys are stored in a hash set in the iterator.<br>
  The `Iter` is stable, returning the non-duplicate items in the order in which they occur in the adapted `Iter`.<br>
  In a set of duplicate items, the first item encountered is the item retained.<br>

* <span id="zip">zip</span> :: \<U>(other: Iterable\<U>) => Iter<[T, U]>

  Zip this `Iter` with another iterator.<br>
  This method takes another iterator and returns a new `Iter` that yields tuples of elements from both iterators.<br>
  The new `Iter` will stop when either iterator stops.

* <span id="zipWith">zipWith</span> :: \<V, U = unknown>(other: Iter\<U>, fn: (a: T, b: U) => V): Iter\<V>

  Creates a new `Iter` that pairs each element of the current `Iter` with the corresponding element of another `Iter`,<br>
  and applies a function to each pair, yielding the results.<br>
  The new `Iter` will stop when either iterator stops.<br>


#### eager evaluation methods

* <span id="count">count</span> :: () => number

  Returns the number of items in the `Iter`.

* <span id="each">each</span> :: (fn: (value: T) => void) => void

  Executes the given function once for each element in the `Iter`.

* <span id="eq">eq</span> :: (other: Iter\<T>) => boolean

  Tests if the current `Iter` is equal to the given `Iter`.<br>
  Two `Iter`s are considered equal if they contain the same elements(tests with deep equality) in the same order.

* <span id="eqBy">eqBy</span> :: (other: Iter\<T>, fn: (a: T, b: T) => boolean) => boolean

  Tests if the current `Iter` is equal to the given `Iter` according to the given equality function.<br>
  Two `Iter`s are considered equal if they contain the same elements in the same order.<br>
  The equality function takes two values of type `T` and returns a boolean that indicates the two values are equalare equal.

* <span id="every">every</span> :: (fn: (value: T) => boolean) => boolean

  Checks if every element of the `Iter` satisfies the given predicate.

* <span id="find">find</span> :: (fn: (value: T) => boolean) => Maybe\<T>

  Returns the first value wrapped in `Just<T>` in the `Iter` for which the given predicate function returns true.<br>
  If no element satisfies the predicate, returns `Nothing`.

* <span id="findIndex">findIndex</span> :: (fn: (value: T) => boolean) => Maybe\<number>

  Returns the index of the first element wrapped in `Just<number>` in the `Iter` that satisfies the given predicate function.<br>
  If no element satisfies the predicate, returns `Nothing`.

* <span id="groupToMap">groupToMap</span> :: \<K>(keySelector: (value: T) => K): Map\<K, Iter\<T>>
  
  Reduces the `Iter` to a `Map` where the keys are values returned by the given function,<br>
  and the values are `Iter`s of the elements that were grouped by the given function.

* <span id="groupToObject">groupToObject</span> :: \<k extends PropertyKey>(keySelector: (value: T) => K): Record\<k, Iter\<T>>

  Reduces the `Iter` to a `Object` where the keys are values returned by the given function,<br>
  and the values are `Iter`s of the elements that were grouped by the given function.

* <span id="interleave">interleave</span> :: (other: Iterable\<T>): Iter\<T>

  Alternate elements from two iterators until both have run out.

* <span id="interleaveShortest">interleaveShortest</span> :: (other: Iterable\<T>): Iter\<T>

  Alternate elements from two iterators until at least one of them has run out.

* <span id="isUnique">isUnique</span> :: (): boolean

  Tests if the current `Iter` contains non duplicate elements.<br>
  Duplicates are detected by by hash and equality.
  
* <span id="isUniqueByKey">isUniqueByKey</span> :: \<K>(fn: (value: T) => K): boolean

  Tests if the current `Iter` contains non duplicate elements according to the given keying function.<br>
  Duplicates are detected by comparing the key they map to with the keying function `fn` by hash and equality.<br>
  The keys are stored in a `Set` in the iterator.<br>

* <span id="join">join</span> :: (sep: string): string

  Join all elements of the `Iter` into a single string, separated by the given separator.

* <span id="last">last</span> :: () => Maybe\<T>

  Returns the last value in the `Iter`, wrapped in `Just<T>`.<br>
  If the `Iter` is empty, returns `Nothing`.

* <span id="ne">ne</span> :: (item: T): Iter\<T>

  Checks if the current `Iter` is not equal to the given `Iter`.<br>
  Two `Iter`s are considered not equal if they contain different elements (tests with deep equality) in the same order,<br>
  or if they have different lengths.<br>

* <span id="neBy">neBy</span> :: (other: Iter\<T>, fn: (a: T, b: T) => boolean): boolean

  Tests if the current `Iter` is not equal to the given `Iter` using the given comparison function.<br>
  Two `Iter`s are considered not equal if they contain the different elements in the same order,<br>
  or if they have different lengths.<br>
  The comparison function takes two values of type `T` and<br>
  returns a boolean that indicates the two values are not equal.<br>

* <span id="nth">nth</span> :: (n: number) => Maybe\<T>

  Returns the nth element of the `Iter`, if it exists.

* <span id="some">some</span> :: (fn: (value: T) => boolean) => boolean

  Checks if any element of the `Iter` satisfies the given predicate function.

* <span id="reduce">reduce</span> :: \<U>(fn: (acc: U, value: T) => U, initial: U) => U

  Reduces the `Iter` to a single value using the provided reducer function and an initial accumulator value.

* <span id="toArray">toArray</span> :: () => T[]

  Returns an array containing all elements of the `Iter`.

* <span id="toMap">toMap</span> :: \<K, V>(toEntry: (value: T) => [K, V]): Map\<K, V>

  Converts an `Iter` to a `Map`.<br>
  The provided function `toEntry` takes a value of type `T` and returns a tuple of type `[K, V]`.<br>
  The resulting `Map` will have the resulting keys of type `K` and the resulting values of type `V`.<br>

* <span id="toObject">toObject</span> :: \<K, V>(toEntry: (value: T) => [K, V]): Record\<K, V>

  Returns a new object, mapping each element of the `Iter` to its corresponding entry in the object.<br>
  The provided function `toEntry` takes a value of type `T` and returns a tuple of type `[K, V]`.<br>
  The resulting `Object` will have the resulting keys of type `K` and the resulting values of type `V`.<br>

* <span id="toSet">toSet</span> :: () => Set\<T>

  Converts the `Iter` to a `Set`.<br>
  Note that the order of the elements in the resulting `Set` is not guaranteed
  to be the same as the order of elements in the original `Iter`,<br>
  because the `Iter` might contain duplicates.<br>

* <span id="toString">toString</span> :: () => string

  Returns a string representation of the `Iter`.

#### eager evaluate values and return lazy `Iter`

* <span id="rev">rev</span> :: () => Iter\<T>

  Reverses an `Iter`'s direction.<br>
  Usually, `Iter`s iterate from left to right.<br>
  After using rev(), an `Iter` will instead iterate from right to left.<br>
  This is only possible if the `Iter` has an end.
