export * from './resources/customers'
export * from './resources/line_items'
export * from './resources/markets'
export * from './resources/orders'
export * from './resources/shipments'
export * from './resources/skus'
export * from './resources/stock_line_items'

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
