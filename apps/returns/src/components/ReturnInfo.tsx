import {
  Button,
  ListDetailsItem,
  Section,
  Text,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'

interface Props {
  returnObj: Return
}

export const ReturnInfo = withSkeletonTemplate<Props>(
  ({ returnObj }): React.JSX.Element => {
    const { canAccess } = useTokenProvider()
    const { navigateTo } = useAppLinking()
    const { t } = useTranslation()

    const returnOrderMarket = returnObj.order?.market?.name
    const returnOrderNumber = `#${returnObj.order?.number}`
    const navigateToOrder = canAccess('orders')
      ? navigateTo({
          app: 'orders',
          resourceId: returnObj?.order?.id
        })
      : {}

    const returnCustomerEmail = returnObj?.customer?.email
    const navigateToCustomer = canAccess('customers')
      ? navigateTo({
          app: 'customers',
          resourceId: returnObj?.customer?.id
        })
      : {}

    return (
      <Section title={t('apps.returns.details.info')}>
        <ListDetailsItem label={t('resources.orders.name')} gutter='none'>
          <Text tag='div' weight='semibold'>
            {canAccess('orders') ? (
              <Button variant='link' {...navigateToOrder}>
                {`${returnOrderMarket} ${returnOrderNumber}`}
              </Button>
            ) : (
              `${returnOrderMarket} ${returnOrderNumber}`
            )}
          </Text>
        </ListDetailsItem>
        <ListDetailsItem label={t('resources.customers.name')} gutter='none'>
          <Text tag='div' weight='semibold'>
            {canAccess('customers') ? (
              <Button variant='link' {...navigateToCustomer}>
                {returnCustomerEmail}
              </Button>
            ) : (
              returnCustomerEmail
            )}
          </Text>
        </ListDetailsItem>
      </Section>
    )
  }
)
