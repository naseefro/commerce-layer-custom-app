import {
  Button,
  EmptyState,
  PageLayout,
  ResourceAttachments,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { CustomerAddresses } from '#components/CustomerAddresses'
import { CustomerAnonymization } from '#components/CustomerAnonymization'
import { CustomerInfo } from '#components/CustomerInfo'
import { CustomerLastOrders } from '#components/CustomerLastOrders'
import { CustomerTimeline } from '#components/CustomerTimeline'
import { CustomerWallet } from '#components/CustomerWallet'
import { appRoutes } from '#data/routes'
import { useCustomerCanBeAnonymized } from '#hooks/useCustomerCanBeAnonymized'
import { useCustomerCanBeDeleted } from '#hooks/useCustomerCanBeDeleted'
import { useCustomerDeleteOverlay } from '#hooks/useCustomerDeleteOverlay'
import { useCustomerDetails } from '#hooks/useCustomerDetails'
import { isMockedId } from '@commercelayer/app-elements'

export function CustomerDetails(): React.JSX.Element {
  const {
    settings: { mode },
    user,
    canUser
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)
  const { goBack } = useAppLinking()
  const { t } = useTranslation()

  const customerId = params?.customerId ?? ''

  const { customer, isLoading, error, mutateCustomer } =
    useCustomerDetails(customerId)
  const canBeDeleted = useCustomerCanBeDeleted(customerId)
  const canBeAnonymized = useCustomerCanBeAnonymized(customerId)

  const { DeleteOverlay, show } = useCustomerDeleteOverlay(customerId)

  const pageTitle = `${customer.email}`

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'customers')) {
    pageToolbar.buttons?.push({
      label: t('common.edit'),
      size: 'small',
      variant: 'secondary',
      onClick: () => {
        setLocation(appRoutes.edit.makePath(customerId))
      }
    })
  }

  if (canBeDeleted || canBeAnonymized) {
    pageToolbar.dropdownItems?.push([
      {
        label: t('common.delete'),
        onClick: () => {
          show()
        }
      }
    ])
  }

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>
            {formatDateWithPredicate({
              predicate: t('common.created'),
              isoDate: customer.created_at ?? '',
              timezone: user?.timezone,
              locale: user?.locale
            })}
          </div>
        </SkeletonTemplate>
      }
      navigationButton={{
        label: t('common.back'),
        icon: 'arrowLeft',
        onClick: () => {
          goBack({
            currentResourceId: customerId,
            defaultRelativePath: appRoutes.list.makePath()
          })
        }
      }}
      gap='only-top'
      scrollToTop
    >
      {error != null ? (
        <EmptyState
          title={t('common.not_authorized')}
          action={
            <Link href={appRoutes.list.makePath()}>
              <Button variant='primary'>{t('common.go_back')}</Button>
            </Link>
          }
        />
      ) : (
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer bottom='4'>
            <CustomerAnonymization customerId={customer.id} />
            <Spacer top='14'>
              <CustomerInfo customer={customer} />
            </Spacer>
            <Spacer top='14'>
              <CustomerLastOrders />
            </Spacer>
            <Spacer top='14'>
              <CustomerWallet
                customer={customer}
                onRemovedPaymentSource={() => {
                  void mutateCustomer()
                }}
              />
            </Spacer>
            <Spacer top='14'>
              <CustomerAddresses customer={customer} />
            </Spacer>

            <Spacer top='14'>
              <ResourceDetails
                resource={customer}
                onUpdated={async () => {
                  void mutateCustomer()
                }}
              />
            </Spacer>

            {!isMockedId(customer.id) && (
              <>
                <Spacer top='14'>
                  <ResourceTags
                    resourceType='customers'
                    resourceId={customer.id}
                    overlay={{ title: pageTitle }}
                    onTagClick={(tagId) => {
                      setLocation(
                        appRoutes.list.makePath(`tags_id_in=${tagId}`)
                      )
                    }}
                  />
                </Spacer>
                <Spacer top='14'>
                  <ResourceMetadata
                    resourceType='customers'
                    resourceId={customer.id}
                    overlay={{
                      title: pageTitle
                    }}
                  />
                </Spacer>
              </>
            )}
            <Spacer top='14'>
              <ResourceAttachments
                resourceType='customers'
                resourceId={customer.id}
              />
            </Spacer>
            <Spacer top='14'>
              <CustomerTimeline customer={customer} />
            </Spacer>
          </Spacer>
        </SkeletonTemplate>
      )}
      {canUser('destroy', 'customers') && <DeleteOverlay />}
    </PageLayout>
  )
}

export default CustomerDetails
