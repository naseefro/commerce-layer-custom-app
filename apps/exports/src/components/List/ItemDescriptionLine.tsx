import {
  formatDateWithPredicate,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Export } from '@commercelayer/sdk'

interface Props {
  job: Export
}

export function DescriptionLine({ job }: Props): React.JSX.Element {
  const { user } = useTokenProvider()

  return (
    <>
      {job.status === 'pending' ? (
        <div>Pending</div>
      ) : job.status === 'in_progress' ? (
        <div>In progress</div>
      ) : job.interrupted_at != null ? (
        <div>
          {formatDateWithPredicate({
            predicate: 'Export failed',
            isoDate: job.interrupted_at,
            timezone: user?.timezone
          })}
        </div>
      ) : job.status === 'completed' ? (
        <div>
          {job.completed_at != null &&
            formatDateWithPredicate({
              predicate: 'Exported',
              isoDate: job.completed_at,
              timezone: user?.timezone
            })}
        </div>
      ) : (
        '-'
      )}
    </>
  )
}
