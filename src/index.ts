import { Position as PositionE, Ordering as OrderingE } from './utils'

export { iter as default, range, repeat, type Iter } from './iter'

export { isIter } from './utils'

export const P = Object.freeze({
  First: PositionE.First,
  Last: PositionE.Last,
  Middle: PositionE.Middle,
  Only: PositionE.Only,
})

export const Position = P

export const O = Object.freeze({
  Less: OrderingE.Less,
  Equal: OrderingE.Equal,
  Greater: OrderingE.Greater,
})

export const Ordering = O