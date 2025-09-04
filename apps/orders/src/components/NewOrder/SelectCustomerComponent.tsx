import {
  HookedInputSelect,
  SkeletonTemplate,
  useCoreApi,
  useCoreSdkProvider,
  useTranslation,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type {
  Customer,
  ListResponse,
  QueryParamsList
} from '@commercelayer/sdk'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function SelectCustomerComponent(): React.JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { watch } = useFormContext()
  const [inputOptions, setInputOptions] = useState<ListResponse<Customer>>()
  const { t } = useTranslation()

  const inputValue = watch('customer_email')

  const { data: customers, isLoading: isLoadingCustomers } = useCoreApi(
    'customers',
    'list',
    [
      {
        filters: {
          email_not_eq: inputValue
        }
      }
    ]
  )

  const { data: selectedCustomer, isLoading: isLoadingSelectedCustomer } =
    useCoreApi('customers', 'list', [
      {
        filters: {
          email_eq: inputValue
        }
      }
    ])

  const isLoading = isLoadingCustomers || isLoadingSelectedCustomer

  const initialValues = toInputSelectValues(
    selectedCustomer?.length === 1 ? selectedCustomer : []
  ).concat(toInputSelectValues(customers ?? []))

  return (
    <SkeletonTemplate isLoading={isLoading} delayMs={0}>
      <HookedInputSelect
        name='customer_email'
        label={`${t('apps.orders.form.email')} *`}
        placeholder={t('apps.orders.form.email_placeholder')}
        hint={{ text: t('apps.orders.form.email_hint') }}
        isCreatable
        menuFooterText={
          (inputOptions == null &&
            customers != null &&
            customers.meta.recordCount > 25) ||
          (inputOptions?.meta.recordCount ?? 0) > 25
            ? t('common.generic_select_autocomplete_hint')
            : undefined
        }
        initialValues={initialValues}
        loadAsyncValues={async (email) => {
          const customers = await sdkClient.customers.list(getParams({ email }))
          setInputOptions(customers)
          return toInputSelectValues(customers)
        }}
      />
    </SkeletonTemplate>
  )
}

function getParams({ email }: { email: string }): QueryParamsList<Customer> {
  return {
    pageSize: 25,
    sort: {
      email: 'asc'
    },
    filters: {
      email_cont: email
    }
  }
}

function toInputSelectValues(
  items: Array<{ email: string; id: string }>
): InputSelectValue[] {
  return items.map(({ email }) => ({
    label: email,
    value: email
  }))
}
