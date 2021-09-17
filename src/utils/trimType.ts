import { Batch } from 'types'

export function trimBatch(batch: Batch): Batch {
  return batch.map(c => {
    return [c[0], c[1].toString()]
  })
}

export function trimMsg(msg: JSON | void): string | void {
  if (!msg) return undefined
  return Buffer.from(JSON.stringify(msg)).toString('base64')
}