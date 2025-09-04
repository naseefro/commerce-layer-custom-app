import {
  Avatar,
  HookedValidationError,
  InputCheckboxGroup,
  ListItem,
  Text,
  useTranslation
} from '@commercelayer/app-elements'
import type { InputCheckboxGroupProps } from '@commercelayer/app-elements/dist/ui/forms/InputCheckboxGroup'
import type { StockLineItem } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
interface Props {
  stockLineItems: StockLineItem[]
}

export function FormPackingFieldItems({
  stockLineItems
}: Props): React.JSX.Element {
  const { t } = useTranslation()

  const options: InputCheckboxGroupProps['options'] = useMemo(
    () =>
      stockLineItems.map((item) => ({
        value: item.id,
        content: (
          <ListItem
            alignIcon='center'
            alignItems='center'
            borderStyle='none'
            icon={
              item.image_url != null ? (
                <Avatar
                  alt={item.name ?? ''}
                  size='small'
                  src={item.image_url as `https://${string}`}
                />
              ) : undefined
            }
            padding='none'
          >
            <div>
              <Text size='regular' tag='div' weight='bold'>
                {item.name}
              </Text>
              {item.sku?.weight != null ? (
                <Text size='small' tag='div' variant='info'>
                  {item.sku?.weight}
                  {item.sku?.unit_of_weight}
                </Text>
              ) : null}
            </div>
          </ListItem>
        ),
        quantity: {
          min: 1,
          max: item.quantity
        }
      })),
    [stockLineItems]
  )

  if (options.length === 0) {
    return <div>No items</div>
  }

  return (
    <>
      <Controller
        name='items'
        render={({ field: { onChange, value } }) => (
          <InputCheckboxGroup
            title={t('apps.shipments.form.packing_items')}
            defaultValues={value}
            options={options}
            onChange={onChange}
          />
        )}
      />
      <HookedValidationError name='items' />
    </>
  )
}
