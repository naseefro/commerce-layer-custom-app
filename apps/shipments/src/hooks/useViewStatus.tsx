import { hasBeenPurchased, useTranslation } from '@commercelayer/app-elements'
import type { ActionButtonsProps } from '@commercelayer/app-elements/dist/ui/composite/ActionButtons'
import type { Shipment, ShipmentUpdate } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useActiveStockTransfers } from './useActiveStockTransfers'
import { usePickingList } from './usePickingList'

type TriggerAttribute =
  | Extract<keyof ShipmentUpdate, `_${string}`>
  | '_create_parcel'

export type Action = Omit<ActionButtonsProps['actions'][number], 'onClick'> & {
  triggerAttribute: TriggerAttribute
}

interface ViewStatus {
  title: string
  progress?: boolean
  headerAction?: Action
  footerActions?: Action[]
  contextActions?: Action[]
}

export function useViewStatus(shipment: Shipment): ViewStatus {
  const { t } = useTranslation()
  const pickingList = usePickingList(shipment)
  const activeStockTransfers = useActiveStockTransfers(shipment)
  const hasPickingItems = pickingList.length > 0
  const hasParcels = shipment.parcels != null && shipment.parcels.length > 0
  const hasCarrierAccounts =
    shipment.carrier_accounts != null && shipment.carrier_accounts.length > 0

  return useMemo(() => {
    const purchased = hasBeenPurchased(shipment)
    const result: ViewStatus = {
      title: !hasPickingItems
        ? t('resources.parcels.name_other')
        : shipment.status === 'packing'
          ? t('apps.shipments.tasks.packing')
          : t('apps.shipments.details.picking_list'),
      progress: shipment.status === 'packing' && hasPickingItems
    }

    switch (shipment.status) {
      case 'upcoming':
        // edge case when shipment is stuck in upcoming status
        // upcoming shipments are only accessible from the orders app.
        result.footerActions = [
          {
            label: 'Start picking',
            triggerAttribute: '_picking'
          }
        ]
        break

      case 'picking':
        result.footerActions = [
          {
            label: t('apps.shipments.actions.put_on_hold'),
            variant: 'secondary',
            triggerAttribute: '_on_hold'
          },
          {
            label: t('apps.shipments.actions.start_packing'),
            triggerAttribute: '_create_parcel'
          }
        ]
        break

      case 'packing':
        if (hasPickingItems) {
          result.headerAction = {
            label: hasParcels
              ? t('apps.shipments.actions.continue_packing')
              : t('apps.shipments.actions.start_packing'),
            triggerAttribute: '_create_parcel'
          }
          result.contextActions = [
            {
              label: t('apps.shipments.actions.set_back_to_picking'),
              triggerAttribute: '_picking'
            }
          ]
        } else {
          if (!purchased) {
            if (hasCarrierAccounts) {
              result.contextActions = [
                {
                  label: t('apps.shipments.actions.set_ready_to_ship'),
                  triggerAttribute: '_ready_to_ship'
                }
              ]
              result.footerActions = [
                {
                  label: t('apps.shipments.actions.purchase_labels'),
                  triggerAttribute: '_get_rates'
                }
              ]
            } else {
              result.footerActions = [
                {
                  label: t('apps.shipments.actions.set_ready_to_ship'),
                  triggerAttribute: '_ready_to_ship'
                }
              ]
            }
          } else {
            result.contextActions = [
              {
                label: t('apps.shipments.actions.set_back_to_picking'),
                triggerAttribute: '_picking'
              }
            ]
            result.footerActions = [
              {
                label: t('apps.shipments.actions.set_ready_to_ship'),
                triggerAttribute: '_ready_to_ship'
              }
            ]
          }
        }
        break

      case 'ready_to_ship':
        result.contextActions = [
          {
            label: t('apps.shipments.actions.set_back_to_picking'),
            triggerAttribute: '_picking'
          }
        ]
        result.footerActions = [
          {
            label: t('apps.shipments.actions.set_shipped'),
            triggerAttribute: '_ship'
          }
        ]
        break

      case 'shipped':
        result.contextActions = []
        result.footerActions = [
          {
            label: t('apps.shipments.actions.set_delivered'),
            triggerAttribute: '_deliver'
          }
        ]
        break

      case 'on_hold':
        result.footerActions =
          activeStockTransfers.length === 0
            ? [
                {
                  label: t('apps.shipments.actions.start_picking'),
                  triggerAttribute: '_picking'
                }
              ]
            : []
        break

      default:
        // Handle unknown status
        break
    }

    return result
  }, [shipment, hasPickingItems, hasParcels, hasBeenPurchased])
}
