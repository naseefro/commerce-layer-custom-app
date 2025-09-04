import { makeBundle } from '#mocks'
import {
  Avatar,
  ListItem,
  Text,
  useAppLinking,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Bundle } from '@commercelayer/sdk'

interface Props {
  resource?: Bundle
  isLoading?: boolean
  delayMs?: number
}

export const ListItemBundle = withSkeletonTemplate<Props>(
  ({ resource = makeBundle() }): React.JSX.Element | null => {
    const { navigateTo } = useAppLinking()

    return (
      <ListItem
        icon={
          <Avatar
            alt={resource.name}
            src={resource.image_url as `https://${string}`}
          />
        }
        alignItems='center'
        {...navigateTo({
          app: 'bundles',
          resourceId: resource.id
        })}
      >
        <div>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {resource.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.name}
          </Text>
        </div>
        <div>
          <Text
            tag='div'
            weight='medium'
            size='small'
            variant='info'
            wrap='nowrap'
          >
            {resource.formatted_compare_at_amount !==
            resource.formatted_price_amount ? (
              <s>{resource.formatted_compare_at_amount}</s>
            ) : (
              <>&nbsp;</>
            )}
          </Text>
          <Text tag='div' weight='semibold' wrap='nowrap'>
            {resource.formatted_price_amount}
          </Text>
        </div>
      </ListItem>
    )
  }
)
