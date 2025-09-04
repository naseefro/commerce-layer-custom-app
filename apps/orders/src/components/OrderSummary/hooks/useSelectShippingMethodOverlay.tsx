import {
  Button,
  Card,
  HookedForm,
  HookedInputRadioGroup,
  Hr,
  ListItem,
  PageLayout,
  ResourceLineItems,
  Section,
  Spacer,
  t,
  Text,
  useCoreSdkProvider,
  useOverlay,
  useTranslation
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useOrderDetails } from '../../../hooks/useOrderDetails'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{
    order: Order
  }>
}

const zodString = z.string({
  required_error: t('validation.required_field')
})

export function useSelectShippingMethodOverlay(): OverlayHook {
  const { Overlay, open, close } = useOverlay()

  return {
    show: open,
    Overlay: ({ order }) => (
      <Overlay>
        <Form order={order} close={close} />
      </Overlay>
    )
  }
}

interface Props {
  order: Order
  onChange?: () => void
  close: () => void
}

const Form: React.FC<Props> = ({ order, close }) => {
  const { t } = useTranslation()
  const formMethods = useForm<Record<string, string>>({
    defaultValues:
      order.shipments?.reduce(
        (acc, shipment) => {
          if (shipment.shipping_method?.id == null) {
            return acc
          }

          return {
            ...acc,
            [shipment.id]: shipment.shipping_method?.id
          }
        },
        {} satisfies Record<string, string>
      ) ?? {},
    resolver: zodResolver(z.object({}).catchall(zodString))
  })

  const {
    formState: { isSubmitting }
  } = formMethods

  const { mutateOrder } = useOrderDetails(order.id)
  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedForm
      {...formMethods}
      onSubmit={(formValues) => {
        void Promise.all(
          Object.entries(formValues).map(
            async ([shipmentId, shippingMethodId]) =>
              await sdkClient.shipments.update({
                id: shipmentId,
                shipping_method: {
                  type: 'shipping_methods',
                  id: shippingMethodId
                }
              })
          )
        ).then(() => {
          close()
          void mutateOrder()
        })
      }}
    >
      <PageLayout
        title={t('common.select_resource', {
          resource: t('resources.shipping_methods.name').toLowerCase()
        })}
        navigationButton={{
          onClick: () => {
            close()
          },
          label: t('common.cancel'),
          icon: 'x'
        }}
      >
        {order.shipments?.map((shipment) => {
          if (shipment.number == null) {
            return null
          }

          return (
            <Spacer key={shipment.id} top='14'>
              <Section
                title={`${t('resources.shipments.name')} #${shipment.number}`}
                border='none'
              >
                <Card overflow='visible'>
                  <Spacer bottom='4'>
                    <Text variant='info'>
                      {t('resources.shipping_methods.name')}:
                    </Text>
                  </Spacer>
                  <HookedInputRadioGroup
                    name={shipment.id}
                    options={
                      shipment.available_shipping_methods?.map(
                        (availableShippingMethod) => ({
                          content: (
                            <ListItem borderStyle='none' padding='none'>
                              <Text weight='semibold'>
                                {availableShippingMethod.name}
                              </Text>
                              <Text weight='semibold'>
                                {availableShippingMethod.formatted_price_amount}
                              </Text>
                            </ListItem>
                          ),
                          value: availableShippingMethod.id
                        })
                      ) ?? []
                    }
                  />
                  <Spacer top='6'>
                    <Hr />
                    <ResourceLineItems
                      size='small'
                      items={shipment.stock_line_items ?? []}
                    />
                  </Spacer>
                </Card>
              </Section>
            </Spacer>
          )
        })}
        <Spacer top='14'>
          <Button type='submit' fullWidth disabled={isSubmitting}>
            {t('common.continue')}
          </Button>
        </Spacer>
      </PageLayout>
    </HookedForm>
  )
}
