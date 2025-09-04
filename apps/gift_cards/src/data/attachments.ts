import type { Attachment } from '@commercelayer/sdk'
import { isEmpty } from 'lodash-es'
import type { SetNonNullable, SetRequired } from 'type-fest'

export const noteReferenceOrigin = 'app-gift_cards--note'

export function isAttachmentValidNote(
  attachment: Attachment
): attachment is SetNonNullable<
  SetRequired<Attachment, 'description' | 'reference_origin'>,
  'description' | 'reference_origin'
> {
  if (
    attachment.reference_origin == null ||
    isEmpty(attachment.reference_origin)
  ) {
    return false
  }

  const validReferenceOrigins: string[] = [noteReferenceOrigin]
  return (
    validReferenceOrigins.includes(attachment.reference_origin) &&
    attachment.description != null
  )
}
