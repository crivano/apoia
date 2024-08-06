'use server'

import { streamValue } from '../../../lib/generate'

export async function produceContent(prompt: string, data: any, date: Date) {
  return await streamValue(prompt, data, date)
}
