# iterator that supports lazy evaluation and chain methods

for more infomation about `Maybe`, `Just` and `Nothing`, see [error-null-handle](https://github.com/Immortal1206/error-null-handle)

### install

```shell
npm install @immortal/iter.js
```

## API reference

  * <a href="#chain">chain</a>
  * <a href="#concat">concat</a>
  * <a href="#count">count</a>
  * <a href="#cycle">cycle</a>
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
  * <a href="#inspect">inspect</a>
  * <a href="#intersperce">intersperce</a>
  * <a href="#isIter">isIter</a>
  * <a href="#iter">iter</a>
  * <a href="#last">last</a>
  * <a href="#map">map</a>
  * <a href="#nth">nth</a>
  * <a href="#partition">partition</a>
  * <a href="#reduce">reduce</a>
  * <a href="#repeat">repeat</a>
  * <a href="#rev">rev</a>
  * <a href="#scan">scan</a>
  * <a href="#skip">skip</a>
  * <a href="#skipWhile">skipWhile</a>
  * <a href="#some">some</a>
  * <a href="#take">take</a>
  * <a href="#takeWhile">takeWhile</a>
  * <a href="#toArray">toArray</a>
  * <a href="#zip">zip</a>

### API to create `Iter` instance

* <span id="iter">iter</span> :: \<T>(iterable: Iterable\<T>) => Iter\<T>

  Create an `Iter` object.

* <span id="repeat">repeat</span> :: \<T>(value: T | (() => T)) => Iter\<T>

  Repeat the given value endlessly.

### type predicate

* <span id="isIter">isIter</span> :: \<T>(value: unknown) => value is Iter\<T>

  Test if a variable is an `Iter` instance.

### `Iter\<T>` instance methods

#### lazy evaluation methods

* <span id="chain">chain</span> :: (other: Iter\<T> | Iterable\<T>) => Iter\<T>

  Concatenates the current `Iter` with the given iterable.

* <span id="concat">concat</span> :: (...others: (Iter\<T> | Iterable\<T>)[]) => Iter\<T>

  Concatenates the given iterators to this `Iter`.

* <span id="cycle">cycle</span> :: () => Iter\<T>

  Repeats the `Iter` endlessly.

* <span id="enumerate">enumerate</span> :: () => Iter<[number, T]>

  Creates an `Iter` which gives the current iteration count as well as the value.

* <span id="filter">filter</span> :: (fn: (value: T) => boolean) => Iter\<T>

  Filters the values in the current `Iter` using the provided predicate function.

* <span id="filterMap">filterMap</span> :: \<U>(fn: (value: T) => U | undefined | null | Maybe\<U>) => Iter\<U>

  Filter and map the values in the current `Iter` using the provided function.<br>
  The filter function takes a value of type `T` and returns a value of type `U | undefined | null | Maybe\<U>`.<br>
  The resulting iterator will only contain the values where the filter function returns a non-`null`/`undefined` value.<br>
  If the filter function returns a `Maybe`, the resulting iterator will only contain the values where the filter function returns a `Just` value.<br>

* <span id="flatMap">flatMap</span> :: \<U>(fn: (value: T) => Iter\<U> | Iterable\<U>) => Iter\<U>

  Maps each value of the current `Iter` to an `Iter` using the given function and flattens the result.

* <span id="flat">flat</span> :: () => Iter\<T>

  Flattens nested iterables within the current `Iter`.

* <span id="inspect">inspect</span> :: (fn: (value: T) => void) => Iter\<T>

  Does something with each element of an Iter, passing the value on.<br>
  When using iterators, you’ll often chain several of them together.<br>
  While working on such code, you might want to check out what’s happening at various parts in the pipeline.<br>
  To do that, insert a call to inspect(). <br>

  It’s more common for inspect() to be used as a debugging tool than to exist in your final code,<br>
  but applications may find it useful in certain situations when errors need to be logged before being discarded.

* <span id="intersperce">intersperce</span> :: (value: T) => Iter\<T>

  Returns a new `Iter` that intersperses the given value between each of the elements of the current `Iter`.<br>
  The new `Iter` will yield the first element of the current `Iter`, then the given value,<br>
  then the second element of the current `Iter`, then the given value again, and so on.<br>

* <span id="map">map</span> :: \<U>(fn: (value: T) => U) => Iter\<U>

  Creates a new `Iter` by applying the given function to each value in the current `Iter`.

* <span id="partition">partition</span> :: (fn: (value: T) => boolean) => [Iter\<T>, Iter\<T>]

  Splits the current `Iter` into two separate `Iter` instances based on the provided predicate function.<br>
  The first `Iter` contains all elements for which the predicate function returns true,<br>
  and the second `Iter` contains all elements for which the predicate function returns false.<br>

* <span id="scan">scan</span> :: \<U>(fn: (acc: U, value: T) => U | null | undefined | Maybe\<U>, initial: U) => Iter\<U>

  Similar to reduce, but yields all intermediate results.<br>
  The function given to this method takes an accumulator and a value from the current `Iter`,<br> 
  and returns the next accumulator value.<br>
  If the function returns null or undefined, the iteration stops.<br>
  If the function returns a `Maybe` that is a `Nothing`, the iteration also stops.<br>

* <span id="skip">skip</span> :: (n: number) => Iter\<T>

  Skips the first `n` elements of the `Iter` and returns a new `Iter` starting from the (n+1)th element.

* <span id="skipWhile">skipWhile</span> :: (shouldSkip: (value: T) => boolean) => Iter\<T>

  Skips elements in the `Iter` until the given function returns false.<br>
  After the first false result, the rest of the elements are yielded.

* <span id="take">take</span> :: (n: number) => Iter\<T>

  Takes the first `n` values from the current `Iter`.<br>
  If the current `Iter` is shorter than `n`, the resulting `Iter` will be shorter than `n`.

* <span id="takeWhile">takeWhile</span> :: (shouldTake: (value: T) => boolean) => Iter\<T>

  Takes elements from the `Iter` as long as the given function returns true.<br>
  Once the function returns false, the iteration stops.

* <span id="zip">zip</span> :: \<U>(other: Iter\<U> | Iterable\<U>) => Iter<[T, U]>

  Zip this `Iter` with another iterator.<br>
  This method takes another iterator and returns a new `Iter` that yields tuples of elements from both iterators.<br>
  The new `Iter` will stop when either iterator stops.

#### eager evaluation methods

* <span id="count">count</span> :: () => number

  Returns the number of items in the `Iter`.

* <span id="eq">eq</span> :: (other: Iter\<T>) => boolean

  Tests if the current `Iter` is equal to the given `Iter`.<br>
  Two `Iter`s are considered equal if they contain the same elements(tests with `Object.is`) in the same order.

* <span id="eqBy">eqBy</span> :: (other: Iter\<T>, fn: (a: T, b: T) => boolean) => boolean

  Tests if the current `Iter` is equal to the given `Iter` according to the given equality function.<br>
  Two `Iter`s are considered equal if they contain the same elements in the same order.<br>
  The equality function takes two values of type `T` and returns a boolean.

* <span id="every">every</span> :: (fn: (value: T) => boolean) => boolean

  Checks if every element of the `Iter` satisfies the given predicate.

* <span id="find">find</span> :: (fn: (value: T) => boolean) => Maybe\<T>

  Returns the first value wrapped in `Just\<T>` in the `Iter` for which the given predicate function returns true.<br>
  If no element satisfies the predicate, returns `Nothing`.

* <span id="findIndex">findIndex</span> :: (fn: (value: T) => boolean) => Maybe<number>

  Returns the index of the first element wrapped in `Just<number>` in the `Iter` that satisfies the given predicate function.<br>
  If no element satisfies the predicate, returns `Nothing`.

* <span id="each">each</span> :: (fn: (value: T) => void) => void

  Executes the given function once for each element in the `Iter`.

* <span id="last">last</span> :: () => Maybe\<T>

  Returns the last value in the `Iter`, wrapped in `Just\<T>`.<br>
  If the `Iter` is empty, returns `Nothing`.

* <span id="nth">nth</span> :: (n: number) => Maybe\<T>

  Returns the nth element of the `Iter`, if it exists.

* <span id="some">some</span> :: (fn: (value: T) => boolean) => boolean

  Checks if any element of the `Iter` satisfies the given predicate function.

* <span id="reduce">reduce</span> :: \<U>(fn: (acc: U, value: T) => U, initial: U) => U

  Reduces the `Iter` to a single value using the provided reducer function and an initial accumulator value.

* <span id="toArray">toArray</span> :: () => T[]

  Returns an array containing all elements of the `Iter`.

#### eager evaluate values and return lazy `Iter`

* <span id="rev">rev</span> :: () => Iter\<T>

  Reverses an `Iter`'s direction.<br>
  Usually, `Iter`s iterate from left to right. After using rev(), an `Iter` will instead iterate from right to left.<br>
  This is only possible if the `Iter` has an end.
