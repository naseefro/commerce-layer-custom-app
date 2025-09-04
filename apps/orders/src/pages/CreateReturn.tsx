import { FormReturn } from '#components/FormReturn'
import { appRoutes } from '#data/routes'
import { useCreateReturnLineItems } from '#hooks/useCreateReturnLineItems'
import { useGetMarketsCount } from '#hooks/useGetMarketsCount'
import { useMarketInventoryModel } from '#hooks/useMarketInventoryModel'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { useReturn } from '#hooks/useReturn'
import { useReturnableList } from '#hooks/useReturnableList'
import { getOrderTitle } from '#utils/getOrderTitle'
import {
  Button,
  EmptyState,
  InputSelect,
  PageLayout,
  ResourceAddress,
  Section,
  SkeletonTemplate,
  Spacer,
  Stack,
  isMock,
  isSingleValueSelected,
  useTokenProvider,
  useTranslation,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { Address, StockLocation } from '@commercelayer/sdk'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

function CreateReturn(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.return.path)
  const { count: marketsCount } = useGetMarketsCount()
  const hideMarket = (marketsCount ?? 0) === 1

  const orderId = params?.orderId ?? ''
  const goBackUrl =
    orderId != null
      ? appRoutes.details.makePath({ orderId })
      : appRoutes.home.makePath({})

  const { order, isLoading, mutateOrder } = useOrderDetails(orderId)
  const { inventoryModel } = useMarketInventoryModel(order.market?.id)
  const returnObj = useReturn(order)

  const returnableLineItems = useReturnableList(order)
  const {
    createReturnLineItemsError,
    createReturnLineItems,
    isCreatingReturnLineItems
  } = useCreateReturnLineItems()

  const [stockLocation, setStockLocation] = useState<StockLocation>()
  const [destinationAddress, setDestinationAddress] = useState<Address>()
  useEffect(() => {
    if (
      destinationAddress === undefined &&
      returnObj?.stock_location?.address != null
    ) {
      setStockLocation(returnObj?.stock_location)
      setDestinationAddress(returnObj?.stock_location?.address)
    }
  }, [destinationAddress, returnObj])

  const orderInventoryReturnLocations =
    inventoryModel?.inventory_return_locations ?? []

  const stockLocations = orderInventoryReturnLocations
    .filter((item) => item.stock_location != null)
    .map((item) => {
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      return item.stock_location as StockLocation
    })

  const stockLocationToSelectOption = useCallback(
    (stockLocation: StockLocation): InputSelectValue => {
      return {
        value: stockLocation.id,
        label: `${stockLocation.name}`,
        meta: stockLocation
      }
    },
    []
  )

  const stockLocationsToSelectOptions = useCallback(
    (stockLocations: StockLocation[]): InputSelectValue[] =>
      stockLocations.map((stockLocation) => {
        return {
          value: stockLocation.id,
          label: `${stockLocation.name}`,
          meta: stockLocation
        }
      }),
    []
  )

  if (
    isMock(order) ||
    returnObj == null ||
    stockLocation == null ||
    destinationAddress == null
  )
    return <></>

  const hasAtLastOneDeliveredShipment = (order.shipments ?? []).some(
    (s) => s.status === 'delivered'
  )
  if (
    (order.fulfillment_status !== 'fulfilled' &&
      !hasAtLastOneDeliveredShipment) ||
    returnableLineItems.length === 0 ||
    !canUser('create', 'returns')
  ) {
    return (
      <PageLayout
        title={t('apps.orders.tasks.request_return')}
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: orderId != null ? 'Back' : 'Orders',
          icon: 'arrowLeft'
        }}
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.not_authorized_description')}
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>{t('common.go_back')}</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      overlay
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {t('apps.orders.tasks.request_return')}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label:
          orderId != null
            ? getOrderTitle(order, { hideMarket })
            : t('resources.orders.name_other'),
        icon: 'arrowLeft'
      }}
      scrollToTop
    >
      {stockLocations.length > 1 && (
        <Spacer bottom='12'>
          <InputSelect
            label={t('apps.returns.details.to_destination')}
            isClearable={false}
            initialValues={stockLocationsToSelectOptions(stockLocations)}
            defaultValue={stockLocationToSelectOption(
              // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
              returnObj.stock_location as StockLocation
            )}
            onSelect={(selectedOption) => {
              if (isSingleValueSelected(selectedOption)) {
                if (selectedOption?.meta?.address != null) {
                  setStockLocation(selectedOption?.meta as StockLocation)
                  setDestinationAddress(
                    selectedOption?.meta?.address as Address
                  )
                }
              }
            }}
          />
        </Spacer>
      )}
      {returnableLineItems != null && returnableLineItems.length !== 0 && (
        <>
          <Spacer bottom='12'>
            <FormReturn
              defaultValues={{
                items: returnableLineItems?.map((item) => ({
                  quantity: item.quantity,
                  value: item.id
                }))
              }}
              lineItems={returnableLineItems}
              apiError={createReturnLineItemsError}
              onSubmit={(formValues) => {
                void createReturnLineItems(
                  returnObj,
                  stockLocation,
                  formValues
                ).then(() => {
                  void mutateOrder().finally(() => {
                    setLocation(goBackUrl)
                  })
                })
              }}
            />
          </Spacer>
          {returnObj.origin_address != null &&
            returnObj?.stock_location?.address != null && (
              <Spacer bottom='12'>
                <Section title='Addresses' border='none'>
                  <Stack>
                    <ResourceAddress
                      title={t('apps.returns.details.origin')}
                      address={returnObj.origin_address}
                      editable
                    />
                    <ResourceAddress
                      title={t('apps.returns.details.destination')}
                      address={destinationAddress}
                    />
                  </Stack>
                </Section>
              </Spacer>
            )}
          <Button
            type='submit'
            form='return-creation-form'
            fullWidth
            disabled={isCreatingReturnLineItems}
          >
            {t('apps.orders.tasks.request_return')}
          </Button>
        </>
      )}
    </PageLayout>
  )
}
export default CreateReturn
