import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemReturn } from '#components/ListItemReturn'
import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Spacer,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

function ReturnsList(): React.JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()
  const { goBack } = useAppLinking()
  const { t } = useTranslation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const hideFiltersNav = !(
    viewTitle == null || viewTitle === presets.history.viewTitle
  )

  return (
    <PageLayout
      title={viewTitle ?? presets.history.viewTitle}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: t('common.back'),
        icon: 'arrowLeft',
        onClick: () => {
          goBack({
            defaultRelativePath: appRoutes.home.makePath()
          })
        }
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath(queryString))
        }}
        hideFiltersNav={hideFiltersNav}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='returns'
          ItemTemplate={ListItemReturn}
          query={{
            fields: {
              returns: [
                'id',
                'number',
                'updated_at',
                'status',
                'stock_location'
              ],
              stock_locations: ['id', 'name']
            },
            include: ['stock_location'],
            pageSize: 25,
            sort: {
              updated_at: 'desc'
            }
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? 'userFiltered' : 'history'}
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}

export default ReturnsList
