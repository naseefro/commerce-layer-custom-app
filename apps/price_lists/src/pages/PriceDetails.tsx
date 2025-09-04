import {
  Button,
  EmptyState,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { PriceInfo } from '#components/PriceInfo'
import { PriceTiers } from '#components/PriceTiers'
import { appRoutes } from '#data/routes'
import { usePriceDetails } from '#hooks/usePriceDetails'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
import { useState } from 'react'

export function PriceDetails(): React.JSX.Element {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ priceListId: string; priceId: string }>(
    appRoutes.priceDetails.path
  )

  const priceListId = params?.priceListId ?? ''
  const priceId = params?.priceId ?? ''

  const { price, isLoading, error, mutatePrice } = usePriceDetails(priceId)
  const { priceList } = usePriceListDetails(priceListId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  const [isDeleting, setIsDeleting] = useState(false)

  if (error != null) {
    return (
      <PageLayout
        title='Price lists'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.pricesList.makePath({ priceListId }))
          },
          label: 'Prices',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.pricesList.makePath({ priceListId })}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = price?.sku?.name

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'prices')) {
    pageToolbar.buttons?.push({
      label: 'Edit',
      size: 'small',
      variant: 'secondary',
      onClick: () => {
        setLocation(appRoutes.priceEdit.makePath({ priceListId, priceId }))
      }
    })
  }

  if (canUser('destroy', 'prices')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          open()
        }
      }
    ])
  }

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {price?.sku?.code ?? ''}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: priceListId,
            defaultRelativePath: appRoutes.pricesList.makePath({ priceListId })
          })
        },
        label: priceListId !== '' ? priceList.name : 'Prices',
        icon: 'arrowLeft'
      }}
      toolbar={pageToolbar}
      scrollToTop
      gap='only-top'
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          <Spacer top='14'>
            <PriceInfo price={price} />
          </Spacer>
          <Spacer top='14'>
            <PriceTiers price={price} mutatePrice={mutatePrice} type='volume' />
          </Spacer>
          <Spacer top='14'>
            <PriceTiers
              price={price}
              mutatePrice={mutatePrice}
              type='frequency'
            />
          </Spacer>
          <Spacer top='14'>
            <ResourceDetails
              resource={price}
              onUpdated={async () => {
                void mutatePrice()
              }}
            />
          </Spacer>
          <Spacer top='14'>
            <ResourceMetadata
              resourceId={price.id}
              resourceType='prices'
              overlay={{
                title: pageTitle ?? ''
              }}
            />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
      {canUser('destroy', 'prices') && (
        <Overlay backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to delete the price related to ${price?.sku?.code} (${price?.sku?.name}) SKU.`}
            description='This action cannot be undone, proceed with caution.'
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: `Cancel`,
              icon: 'x'
            }}
          >
            <Button
              variant='danger'
              size='small'
              disabled={isDeleting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.prices
                  .delete(price.id)
                  .then(() => {
                    setLocation(appRoutes.pricesList.makePath({ priceListId }))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete price
            </Button>
          </PageLayout>
        </Overlay>
      )}
    </PageLayout>
  )
}
