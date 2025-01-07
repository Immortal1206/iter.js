import { Position } from './utils'

export { iter as default, range, repeat, type Iter } from './iter'

export { isIter } from './utils'

export const P = Object.freeze({
  First: Position.First,
  Last: Position.Last,
  Middle: Position.Middle,
  Only: Position.Only,
})