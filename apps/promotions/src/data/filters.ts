import type { FiltersInstructions } from '@commercelayer/app-elements'
import type { PromotionType } from './promotions/config'

const filtersWhitelist: FiltersInstructions = [
  'starts_at_lteq',
  'expires_at_gteq',
  'disabled_at_null',
  'starts_at_gt'
].map((predicate) => ({
  hidden: true,
  label: predicate,
  type: 'textSearch',
  sdk: {
    predicate
  },
  render: {
    component: 'input'
  }
}))

export const filtersInstructions: FiltersInstructions = filtersWhitelist.concat(
  [
    // {
    //   label: 'Status',
    //   type: 'options',
    //   sdk: [
    //     {
    //       predicate: 'starts_at_lteq',
    //       parseFormValue: (value) => value === 'active' ? new Date().toJSON() : null
    //     },
    //     {
    //       predicate: 'expires_at_gteq',
    //       parseFormValue: (value) => value === 'active' ? new Date().toJSON() : null
    //     },
    //     {
    //       predicate: 'starts_at_gteq',
    //       parseFormValue: (value) => value === 'upcoming' ? new Date().toJSON() : null
    //     },
    //     {
    //       predicate: 'expires_at_lteq',
    //       parseFormValue: (value) => value === 'expired' ? new Date().toJSON() : null
    //     },
    //     {
    //       predicate: 'disabled_at',
    //       parseFormValue: (value) => value === 'disabled' ? 'true' : null
    //     }
    //   ],
    //   render: {
    //     component: 'inputToggleButton',
    //     props: {
    //       mode: 'multi',
    //       options: [
    //         { value: 'active', label: 'Active' },
    //         { value: 'upcoming', label: 'Upcoming' },
    //         { value: 'expired', label: 'Expired' },
    //         { value: 'disabled', label: 'Disabled' }
    //       ]
    //     }
    //   }
    // },

    {
      label: 'Type',
      type: 'options',
      sdk: {
        predicate: 'type_in',
        defaultOptions: [
          'buy_x_pay_y_promotions',
          'fixed_amount_promotions',
          'fixed_price_promotions',
          'free_gift_promotions',
          'free_shipping_promotions',
          'percentage_discount_promotions',
          'external_promotions',
          'flex_promotions'
        ]
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'multi',
          options: [
            { value: 'buy_x_pay_y_promotions', label: 'Buy X pay Y' },
            { value: 'fixed_amount_promotions', label: 'Fixed amount' },
            { value: 'fixed_price_promotions', label: 'Fixed price' },
            { value: 'free_gift_promotions', label: 'Free gift' },
            { value: 'free_shipping_promotions', label: 'Free shipping' },
            {
              value: 'percentage_discount_promotions',
              label: 'Perc. discount'
            },
            { value: 'external_promotions', label: 'External' },
            { value: 'flex_promotions', label: 'Flex' }
          ] as Array<{ value: PromotionType; label: string }>
        }
      }
    },

    {
      label: 'Coupons',
      type: 'options',
      sdk: {
        predicate: 'coupons_code_present'
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'single',
          options: [
            { value: 'true', label: 'With coupons' },
            { value: 'false', label: 'Without coupons' }
          ]
        }
      }
    },

    {
      label: 'Priority',
      type: 'options',
      sdk: {
        predicate: 'priority_null'
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'single',
          options: [
            { value: 'false', label: 'Has priority' },
            { value: 'true', label: "Doesn't have priority" }
          ]
        }
      }
    },

    {
      label: 'Exclusive',
      type: 'options',
      sdk: {
        predicate: 'exclusive_true'
      },
      render: {
        component: 'inputToggleButton',
        props: {
          mode: 'single',
          options: [
            { value: 'true', label: 'Is exclusive' },
            { value: 'false', label: "Isn't exclusive" }
          ]
        }
      }
    },

    {
      label: 'Search',
      type: 'textSearch',
      sdk: {
        predicate: ['name', 'coupons_code'].join('_or_') + '_cont'
      },
      render: {
        component: 'searchBar'
      }
    }
  ]
)
