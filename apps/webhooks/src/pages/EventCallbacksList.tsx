import { ListItemEvenCallback } from '#components/ListItemEventCallback'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export const EventCallbacksList: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute(appRoutes.webhookEventCallbacks.path)

  const webhookId = params == null ? null : params.webhookId

  if (
    webhookId == null ||
    !canUser('read', 'webhooks') ||
    !canUser('read', 'event_callbacks')
  ) {
    return (
      <PageLayout
        title='Event callbacks'
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title='Event Callbacks'
      mode={settings.mode}
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.details.makePath({ webhookId }))
        },
        label: `Cancel`,
        icon: 'x'
      }}
    >
      <EventList webhookId={webhookId} />
      {/* <EventCallbacksListItems eventCallbacks={list} /> */}
    </PageLayout>
  )
}

const EventList: FC<{ webhookId: string }> = ({ webhookId }) => {
  const { ResourceList } = useResourceList({
    type: 'event_callbacks',
    query: {
      filters: { webhook_id_eq: webhookId },
      pageSize: 25,
      sort: ['-updated_at']
    }
  })

  return (
    <ResourceList
      title='All event callbacks'
      emptyState={<EmptyState title='No event callbacks yet!' />}
      ItemTemplate={ListItemEvenCallback}
    />
  )
}
