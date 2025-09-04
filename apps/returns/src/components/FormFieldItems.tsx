import {
  Avatar,
  HookedInputCheckboxGroup,
  ListItem,
  Text,
  useTranslation,
  type HookedInputCheckboxGroupProps
} from '@commercelayer/app-elements'

import type { ReturnLineItem } from '@commercelayer/sdk'
import { useMemo } from 'react'
interface Props {
  returnLineItems: ReturnLineItem[]
}

export function FormFieldItems({ returnLineItems }: Props): React.JSX.Element {
  const { t } = useTranslation()

  const options: HookedInputCheckboxGroupProps['options'] = useMemo(
    () =>
      returnLineItems.map((item) => ({
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
            <Text size='regular' tag='div' weight='bold'>
              {item.name}
            </Text>
            <Text size='regular' tag='div' weight='bold' wrap='nowrap'>
              x {item.quantity}
            </Text>
          </ListItem>
        )
      })),
    [returnLineItems]
  )

  if (options.length === 0) {
    return <div>{t('apps.returns.form.no_items')}</div>
  }

  return (
    <>
      <HookedInputCheckboxGroup
        name='items'
        title={t('apps.returns.form.items')}
        options={options}
      />
    </>
  )
}
