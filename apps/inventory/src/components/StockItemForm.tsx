import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputSelect,
  HookedValidationApiError,
  Section,
  Spacer,
  Text
} from '@commercelayer/app-elements'
import type { Sku, StockItem } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { ListItemSku } from './ListItemSku'
import { StockLocationSelector } from './StockLocationSelector'

const stockItemFormSchema = z.object({
  id: z.string().optional(),
  stockLocation: z.string().min(1),
  item: z.string().min(1),
  quantity: z.number().min(0)
})

export type StockItemFormValues = z.infer<typeof stockItemFormSchema>

interface Props {
  resource?: StockItem
  defaultValues?: Partial<StockItemFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: StockItemFormValues,
    setError: UseFormSetError<StockItemFormValues>
  ) => void
  apiError?: any
}

export function StockItemForm({
  resource,
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): React.JSX.Element {
  const stockItemFormMethods = useForm<StockItemFormValues>({
    defaultValues,
    resolver: zodResolver(stockItemFormSchema)
  })

  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay()

  const [selectedItemResource, setSelectedItemResource] = useState<Sku>()
  const sku = resource?.sku != null ? resource?.sku : selectedItemResource
  const stockItemFormWatchedItem = stockItemFormMethods.watch('item')

  return (
    <>
      <HookedForm
        {...stockItemFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, stockItemFormMethods.setError)
        }}
      >
        <Section>
          {defaultValues?.stockLocation == null && (
            <Spacer top='12' bottom='4'>
              <StockLocationSelector />
            </Spacer>
          )}
          <Spacer
            top={defaultValues?.stockLocation == null ? '6' : '12'}
            bottom='4'
          >
            <Text weight='semibold'>SKU</Text>
            <Spacer top='2'>
              {stockItemFormWatchedItem == null ? (
                <div
                  onClick={() => {
                    showAddItemOverlay({ type: 'skus' })
                  }}
                >
                  <HookedInputSelect
                    name='item'
                    initialValues={[]}
                    placeholder='Select an SKU'
                    onSelect={() => {}}
                  />
                </div>
              ) : (
                <ListItemSku
                  resource={sku}
                  disabled={defaultValues?.id != null}
                  variant='boxed'
                  onSelect={() => {
                    if (defaultValues?.id == null) {
                      showAddItemOverlay({ type: 'skus', excludedId: sku?.id })
                    }
                  }}
                />
              )}
              <AddItemOverlay
                onConfirm={(resource) => {
                  setSelectedItemResource(resource)
                  stockItemFormMethods.setValue('item', resource.id)
                }}
              />
            </Spacer>
          </Spacer>
          <Spacer top='6' bottom='4'>
            <HookedInput
              name='quantity'
              label='Quantity'
              type='number'
              min='0'
            />
          </Spacer>
        </Section>
        <Spacer top='14'>
          <Button type='submit' disabled={isSubmitting} fullWidth>
            {defaultValues?.id == null ? 'Create' : 'Update'}
          </Button>
          <Spacer top='2'>
            <HookedValidationApiError apiError={apiError} />
          </Spacer>
        </Spacer>
      </HookedForm>
    </>
  )
}
