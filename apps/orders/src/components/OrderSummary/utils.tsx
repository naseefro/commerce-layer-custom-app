import { ListItem, Text, t } from '@commercelayer/app-elements'
import type { LineItem, Order } from '@commercelayer/sdk'
import { Fragment } from 'react'

interface TotalRowProps {
  /** Displayed label */
  label: React.ReactNode
  /** Amount cents */
  amountCents: number | undefined | null
  /** Formatted amount */
  formattedAmount: React.ReactNode
  /** Set font-weight to bold */
  bold?: boolean

  /**
   * When `true` the row will be always printed even if the `amountCents` is equal to 0.
   * @default false
   */
  force?: boolean
}

export function renderTotalRow({
  label,
  value,
  bold = false
}: {
  label: React.ReactNode
  value: React.ReactNode
  bold?: boolean
}): React.JSX.Element {
  return (
    <ListItem borderStyle='none' padding='y' paddingSize='2'>
      <Text weight={bold ? 'bold' : 'medium'}>{label}</Text>
      <Text wrap='nowrap' weight={bold ? 'bold' : 'medium'}>
        {value}
      </Text>
    </ListItem>
  )
}

export function renderTotalRowAmount({
  label,
  amountCents,
  formattedAmount,
  force = false,
  bold = false
}: TotalRowProps): React.JSX.Element | null {
  if (formattedAmount == null) {
    formattedAmount = ''
  }

  const showRow = force || (amountCents != null && amountCents !== 0)

  return showRow
    ? renderTotalRow({ label, value: formattedAmount, bold })
    : null
}

export function renderDiscounts(order: Order): React.JSX.Element | null {
  type ItemType = NonNullable<Order['line_items']>[number]['item_type']
  type PromotionItemType = Extract<ItemType, `${string}_promotions`>

  const validDiscounts = Object.keys({
    external_promotions: undefined,
    fixed_amount_promotions: undefined,
    fixed_price_promotions: undefined,
    free_gift_promotions: undefined,
    free_shipping_promotions: undefined,
    percentage_discount_promotions: undefined,
    buy_x_pay_y_promotions: undefined,
    flex_promotions: undefined
  } satisfies Record<PromotionItemType, undefined>) as ItemType[]

  const promotionLineItems =
    order.line_items?.filter((lineItem) =>
      validDiscounts.includes(lineItem.item_type)
    ) ?? []

  return (
    <>
      {promotionLineItems.map((promotionLineItem) => (
        <Fragment key={promotionLineItem.id}>
          {renderTotalRowAmount({
            label:
              promotionLineItem.name ??
              promotionLineItem.item_type ??
              t('apps.orders.details.discount'),
            amountCents: promotionLineItem.total_amount_cents,
            formattedAmount: promotionLineItem.formatted_total_amount
          })}
        </Fragment>
      ))}
    </>
  )
}

export const manualAdjustmentReferenceOrigin = 'app-orders--manual-adjustment'

export function getManualAdjustment(order: Order): LineItem | undefined {
  const [manualAdjustment] =
    order.line_items?.filter(
      (lineItem) =>
        lineItem.item_type === 'adjustments' &&
        lineItem.reference_origin === manualAdjustmentReferenceOrigin
    ) ?? []

  return manualAdjustment
}

export function renderAdjustments(order: Order): React.JSX.Element | null {
  const adjustmentLineItems =
    order.line_items?.filter(
      (lineItem) =>
        lineItem.item_type === 'adjustments' &&
        lineItem.reference_origin !== manualAdjustmentReferenceOrigin
    ) ?? []

  return (
    <>
      {adjustmentLineItems.map((adjustmentLineItem) => (
        <Fragment key={adjustmentLineItem.id}>
          {renderTotalRowAmount({
            label:
              adjustmentLineItem.name ??
              adjustmentLineItem.item_type ??
              t('resources.adjustments.name'),
            amountCents: adjustmentLineItem.total_amount_cents,
            formattedAmount: adjustmentLineItem.formatted_total_amount
          })}
        </Fragment>
      ))}
    </>
  )
}

export function arrayOf<T>(arr: T[]): T[] {
  return arr
}
