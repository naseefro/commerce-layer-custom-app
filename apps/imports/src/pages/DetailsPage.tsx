import { ImportDate } from '#components/Details/ImportDate'
import { ImportDetails } from '#components/Details/ImportDetails'
import { ImportedResourceType } from '#components/Details/ImportedResourceType'
import { ImportReport } from '#components/Details/ImportReport'
import { ImportDetailsProvider } from '#components/Details/Provider'
import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  isMockedId,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

const DetailsPage = (): React.JSX.Element | null => {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const [_, setLocation] = useLocation()
  const [_match, params] = useRoute<{ importId?: string }>(
    appRoutes.details.path
  )
  const importId = params == null ? null : params.importId

  if (importId == null || !canUser('read', 'imports')) {
    return (
      <PageLayout
        title='Imports'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(appRoutes.list.makePath())
          }
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <ImportDetailsProvider importId={importId}>
      {({ state: { data, isLoading, isNotFound }, refetch }) =>
        isNotFound ? (
          <ErrorNotFound />
        ) : (
          <SkeletonTemplate isLoading={isLoading}>
            <PageLayout
              title={<ImportedResourceType />}
              mode={mode}
              description={<ImportDate atType='created_at' includeTime />}
              navigationButton={{
                label: 'Imports',
                icon: 'arrowLeft',
                onClick: () => {
                  setLocation(appRoutes.list.makePath())
                }
              }}
            >
              <Spacer bottom='14'>
                <ImportReport />
              </Spacer>

              <Spacer bottom='14'>
                <ImportDetails />
              </Spacer>

              <Spacer bottom='14'>
                <ResourceDetails
                  resource={data}
                  onUpdated={async () => {
                    void refetch()
                  }}
                />
              </Spacer>

              {!isMockedId(data.id) && (
                <Spacer top='14'>
                  <ResourceMetadata
                    resourceType='imports'
                    resourceId={data.id}
                    overlay={{
                      title: 'Back'
                    }}
                  />
                </Spacer>
              )}
            </PageLayout>
          </SkeletonTemplate>
        )
      }
    </ImportDetailsProvider>
  )
}

export default DetailsPage
